// Only provider-controlled hosts are safe here. Arbitrary user domains would
// additionally require DNS validation and connection IP pinning.
const CSS_HOSTS = new Set([
  'gist.githubusercontent.com',
  'raw.githubusercontent.com'
])

export function parseCssUrl(value) {
  if (typeof value !== 'string') throw new Error('Invalid CSS URL')
  const target = new URL(value)
  if (
    target.protocol !== 'https:' ||
    !CSS_HOSTS.has(target.hostname) ||
    target.port ||
    target.username ||
    target.password ||
    target.hash
  )
    throw new Error('Invalid CSS URL')
  return target
}
