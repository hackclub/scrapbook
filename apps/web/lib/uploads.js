const UPLOAD_HOSTS = new Set([
  'scrapbook-into-the-redwoods.s3.amazonaws.com',
  'scrapbook-into-the-redwoods.s3.us-east-1.amazonaws.com'
])

export function ownedUploadKey(value, accountId) {
  if (!accountId) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !UPLOAD_HOSTS.has(url.hostname))
      return null
    const key = decodeURIComponent(url.pathname.slice(1))
    return key.startsWith(`web/${accountId}/`) && !key.split('/').includes('..')
      ? key
      : null
  } catch {
    return null
  }
}
