import { parseCssUrl } from './css-url'

export function profileInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new Error('Invalid profile')
  const data = { ...body }
  for (const field of [
    'name',
    'username',
    'location',
    'description',
    'pronouns',
    'banner',
    'logo',
    'website',
    'github',
    'avatar',
    'cssURL',
    'customDomain'
  ]) {
    const value = data[field]
    if (
      value != null &&
      (typeof value !== 'string' ||
        value.length > (field === 'description' ? 10000 : 2000))
    ) {
      throw new Error('Invalid profile field')
    }
  }
  for (const field of ['website', 'github', 'avatar', 'banner', 'logo']) {
    const value = data[field]
    if (!value) continue
    const url = new URL(
      /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`
    )
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error('Invalid website URL')
    data[field] = url.href
  }
  if (data.cssURL) data.cssURL = parseCssUrl(data.cssURL).href
  if (
    data.customDomain &&
    !/^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,63}$/i.test(
      data.customDomain
    )
  ) {
    throw new Error('Invalid custom domain')
  }
  return data
}
