import { afterEach, expect, mock, spyOn, test } from 'bun:test'
import * as dns from 'node:dns'
import {
  isPublicAddress,
  publicLookup,
  publicFetch
} from '../apps/slack-bot/src/lib/public-fetch'

afterEach(() => mock.restore())

for (const address of [
  '0.0.0.0',
  '10.0.0.1',
  '100.100.100.200',
  '127.0.0.1',
  '169.254.169.254',
  '172.16.0.1',
  '192.168.1.1',
  '198.18.0.1',
  '224.0.0.1',
  '255.255.255.255',
  '::',
  '::1',
  'fc00::1',
  'fe80::1',
  '::ffff:127.0.0.1',
  '::ffff:8.8.8.8',
  '2002:7f00:1::',
  '2001:db8::1'
])
  test(`preview blocks non-public address ${address}`, () => {
    expect(isPublicAddress(address)).toBe(false)
  })

for (const address of ['1.1.1.1', '8.8.8.8', '2606:4700:4700::1111']) {
  test(`preview permits public address ${address}`, () => {
    expect(isPublicAddress(address)).toBe(true)
  })
}

test('socket lookup rejects mixed public/private DNS answers', async () => {
  spyOn(dns, 'lookup').mockImplementation((_host, _options, callback) =>
    callback(null, [
      { address: '8.8.8.8', family: 4 },
      { address: '127.0.0.1', family: 4 }
    ])
  )
  await new Promise<void>(resolve =>
    publicLookup('attacker.invalid', {}, error => {
      expect(error).toBeInstanceOf(Error)
      resolve()
    })
  )
})

test('socket lookup returns the validated address without a second resolution', async () => {
  const resolver = spyOn(dns, 'lookup').mockImplementation(
    (_host, _options, callback) =>
      callback(null, [{ address: '8.8.8.8', family: 4 }])
  )
  await new Promise<void>(resolve =>
    publicLookup('public.invalid', {}, (error, address, family) => {
      expect(error).toBeNull()
      expect(address).toBe('8.8.8.8')
      expect(family).toBe(4)
      resolve()
    })
  )
  expect(resolver).toHaveBeenCalledTimes(1)
})

for (const url of [
  'file:///etc/hostname',
  'http://2130706433/',
  'http://2852039166/',
  'http://0x7f000001/',
  'http://[::1]/',
  'https://user:pass@example.com/'
]) {
  test(`preview rejects dangerous URL ${url}`, async () => {
    await expect(publicFetch(url)).rejects.toThrow()
  })
}

test('hostname resolving to loopback cannot reach a local HTTP service', async () => {
  let hits = 0
  const server = Bun.serve({
    port: 0,
    fetch: () => {
      hits++
      return new Response('private')
    }
  })
  spyOn(dns, 'lookup').mockImplementation((_host, _options, callback) =>
    callback(null, [{ address: '127.0.0.1', family: 4 }])
  )
  try {
    await expect(publicFetch('http://attacker.invalid/')).rejects.toThrow(
      'Non-public destination'
    )
    expect(hits).toBe(0)
  } finally {
    server.stop(true)
  }
})
