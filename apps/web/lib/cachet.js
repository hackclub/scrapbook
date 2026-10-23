const CACHE_TTL_MS = 5 * 60 * 1000
const profiles = new Map()
const validSlackId = id =>
  typeof id === 'string' && /^[UW][A-Z0-9]{8,}$/.test(id)

// Keep uploaded/custom avatars; let Cachet refresh Slack-hosted avatars without
// exposing an email hash or requiring Slack credentials on the website.
export function profileAvatar(profile) {
  const avatar = profile?.avatar
  if (
    validSlackId(profile?.slackID) &&
    (!avatar || /^https:\/\/[^/]*slack-edge\.com\//.test(avatar))
  )
    return `https://cachet.hackclub.com/users/${profile.slackID}/r`
  return avatar || null
}

export async function getCachetProfile(slackID) {
  if (!validSlackId(slackID)) return null
  const cached = profiles.get(slackID)
  if (cached && cached.expires > Date.now()) return cached.promise

  const promise = (async () => {
    try {
      const response = await fetch(
        `https://cachet.hackclub.com/users/${slackID}`,
        {
          redirect: 'error',
          signal: AbortSignal.timeout(1500),
          headers: { Accept: 'application/json' }
        }
      )
      // 202 is an uncached placeholder, not enrichment data.
      if (response.status !== 200) return null
      const data = await response.json()
      if ((data.userId || data.id) !== slackID) return null
      return {
        displayName:
          typeof data.displayName === 'string'
            ? data.displayName.slice(0, 200)
            : null,
        pronouns:
          typeof data.pronouns === 'string' ? data.pronouns.slice(0, 200) : null
      }
    } catch {
      return null
    }
  })()
  if (profiles.size >= 512) profiles.delete(profiles.keys().next().value)
  profiles.set(slackID, { promise, expires: Date.now() + CACHE_TTL_MS })
  return promise
}

export async function enrichPublicProfile(profile) {
  if (!profile) return profile
  const cached = await getCachetProfile(profile.slackID)
  if (!cached) return profile
  return {
    ...profile,
    displayName: cached.displayName || profile.username,
    pronouns: profile.pronouns || cached.pronouns
  }
}
