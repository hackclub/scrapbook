// Cookie-authenticated writes must never be triggered by GETs or simple forms.
export function requireMutation(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: true, message: 'Method not allowed' })
    return false
  }
  const contentType = req.headers['content-type']?.split(';')[0].trim()
  const origin = req.headers.origin
  let sameOrigin = true
  try {
    if (origin) sameOrigin = new URL(origin).host === req.headers.host
  } catch {
    sameOrigin = false
  }
  if (
    contentType !== 'application/json' ||
    !sameOrigin ||
    ['cross-site', 'same-site'].includes(req.headers['sec-fetch-site'])
  ) {
    res.status(403).json({
      error: true,
      message: 'Forbidden request origin or content type'
    })
    return false
  }
  return true
}
