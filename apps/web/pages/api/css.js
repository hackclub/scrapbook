import { parseCssUrl } from '../../lib/css-url'
const MAX_CSS_BYTES = 1024 * 1024
const FETCH_TIMEOUT_MS = 5000

export default async (req, res) => {
  // These must also cover validation errors and upstream failures.
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.removeHeader('Access-Control-Allow-Origin')

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let target
  try {
    target = parseCssUrl(req.query.url)
  } catch {
    return res.status(400).json({
      error:
        'CSS must use an HTTPS URL on gist.githubusercontent.com or raw.githubusercontent.com'
    })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const upstream = await fetch(target.href, {
      // Never follow even an allowlisted host's redirect to another destination.
      redirect: 'error',
      signal: controller.signal,
      credentials: 'omit',
      headers: { Accept: 'text/css, text/plain' }
    })
    const contentType = upstream.headers
      .get('content-type')
      ?.split(';')[0]
      .trim()
    if (
      !upstream.ok ||
      !['text/css', 'text/plain'].includes(contentType) ||
      Number(upstream.headers.get('content-length')) > MAX_CSS_BYTES ||
      !upstream.body
    ) {
      throw new Error('Invalid upstream response')
    }

    // Bound the decoded body too: Content-Length can be missing or compressed.
    const chunks = []
    let size = 0
    for await (const chunk of upstream.body) {
      size += chunk.byteLength
      if (size > MAX_CSS_BYTES) throw new Error('CSS too large')
      chunks.push(chunk)
    }
    res.setHeader('Content-Type', 'text/css; charset=utf-8')
    return res.status(200).send(Buffer.concat(chunks).toString('utf8'))
  } catch {
    // Never include upstream bodies, request details, or runtime errors.
    return res.status(502).json({ error: 'Could not download CSS' })
  } finally {
    clearTimeout(timer)
    controller.abort()
  }
}
