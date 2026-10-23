import { afterEach, expect, spyOn, test } from 'bun:test'
import css from '../apps/web/pages/api/css'

function response() {
  return {
    headers: new Map([['Access-Control-Allow-Origin', '*']]),
    code: 200,
    body: undefined as unknown,
    setHeader(name, value) {
      this.headers.set(name, value)
    },
    removeHeader(name) {
      this.headers.delete(name)
    },
    status(code) {
      this.code = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
    send(body) {
      this.body = body
      return this
    }
  }
}
afterEach(() => {
  globalThis.fetch = originalFetch
})
const originalFetch = globalThis.fetch

for (const url of [
  undefined,
  ['https://raw.githubusercontent.com/a.css'],
  '',
  'not a URL',
  'file:///etc/hostname',
  'file:///proc/self/environ',
  'data:text/css,test',
  'gopher://127.0.0.1/',
  'http://2852039166/',
  'https://169.254.169.254/',
  'https://0x7f000001/',
  'https://0177.0.0.1/',
  'https://[::1]/',
  'https://[::ffff:127.0.0.1]/',
  'https://localhost/',
  'https://example.com/',
  'http://raw.githubusercontent.com/test.css',
  'https://raw.githubusercontent.com.attacker.invalid/test.css',
  'https://raw.githubusercontent.com@127.0.0.1/test.css',
  'https://attacker@raw.githubusercontent.com/test.css',
  'https://raw.githubusercontent.com:8443/test.css',
  'https://raw.githubusercontent.com./test.css'
]) {
  test(`CSS rejects ${JSON.stringify(url)} before fetching`, async () => {
    const fetcher = spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error('Must not fetch')
    )
    const res = response()
    await css({ method: 'GET', query: { url } }, res)
    expect(res.code).toBe(400)
    expect(fetcher).not.toHaveBeenCalled()
    expect(res.headers.get('Cache-Control')).toContain('no-store')
    expect(res.headers.has('Access-Control-Allow-Origin')).toBe(false)
  })
}

test('CSS accepts GitHub raw text, uses no redirects or credentials, and does not cache', async () => {
  const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('body { color: red }', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  )
  const res = response()
  await css(
    {
      method: 'GET',
      query: { url: 'https://gist.githubusercontent.com/user/id/raw/theme.css' }
    },
    res
  )
  expect(res.code).toBe(200)
  expect(res.body).toBe('body { color: red }')
  expect(fetcher.mock.calls[0][1]?.redirect).toBe('error')
  expect(fetcher.mock.calls[0][1]?.credentials).toBe('omit')
  expect(res.headers.get('Content-Type')).toBe('text/css; charset=utf-8')
  expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
  expect(res.headers.get('Cache-Control')).toContain('no-store')
})

for (const upstream of [
  () =>
    new Response('internal body', {
      status: 302,
      headers: { Location: 'file:///etc/hostname' }
    }),
  () => new Response('secret error', { status: 500 }),
  () =>
    new Response('<html>not css</html>', {
      headers: { 'Content-Type': 'text/html' }
    }),
  () =>
    new Response('large', {
      headers: { 'Content-Type': 'text/plain', 'Content-Length': '1048577' }
    }),
  () =>
    new Response('x'.repeat(1048577), {
      headers: { 'Content-Type': 'text/plain' }
    })
]) {
  test('CSS rejects invalid upstream responses without returning their body', async () => {
    spyOn(globalThis, 'fetch').mockResolvedValue(upstream())
    const res = response()
    await css(
      {
        method: 'GET',
        query: { url: 'https://raw.githubusercontent.com/a/b/main/test.css' }
      },
      res
    )
    expect(res.code).toBe(502)
    expect(res.body).toEqual({ error: 'Could not download CSS' })
    expect(res.headers.get('Cache-Control')).toContain('no-store')
  })
}

test('CSS aborts a stalled upstream', async () => {
  spyOn(globalThis, 'fetch').mockImplementation(
    (_url, options) =>
      new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () =>
          reject(new Error('secret runtime details'))
        )
      })
  )
  const res = response()
  await css(
    {
      method: 'GET',
      query: { url: 'https://raw.githubusercontent.com/a/b/main/test.css' }
    },
    res
  )
  expect(res.code).toBe(502)
  expect(res.body).toEqual({ error: 'Could not download CSS' })
}, 7000)
