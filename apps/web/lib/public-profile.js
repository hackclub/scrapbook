import { emailToPfp } from './email'
import { profileAvatar } from './cachet'

// Keep identity metadata, email, timezone and webhook credentials out of public
// APIs and Next.js page props, including fields added to Accounts in the future.
const PUBLIC_FIELDS = [
  'id',
  'username',
  'slackID',
  'avatar',
  'streakCount',
  'maxStreaks',
  'displayStreak',
  'customDomain',
  'cssURL',
  'website',
  'github',
  'webring',
  'pronouns',
  'customAudioURL'
]

export function publicProfile(profile) {
  if (!profile) return profile
  const result = Object.fromEntries(
    PUBLIC_FIELDS.filter(key => Object.hasOwn(profile, key)).map(key => [
      key,
      profile[key]
    ])
  )
  result.avatar = profileAvatar(profile) || emailToPfp(profile.email || '')
  return result
}
