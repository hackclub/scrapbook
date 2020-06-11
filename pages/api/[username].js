import { find, reverse, orderBy, filter } from 'lodash'
import { getRawUsers } from './profiles'

export const getProfile = async (username) => {
  const accounts = await getRawUsers()
  const user = find(accounts, ['fields.Username', username]) || {}
  if (!user) return {}
  const profile = {
    id: user?.id,
    username,
    streakDisplay: user?.fields['Display Streak'] || false,
    streakCount: user?.fields['Streak Count'] || 1
  }
  return profile
}

export const getPosts = async (profile) => {
  const allUpdates = await fetch(
    'https://api2.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Updates'
  ).then(r => r.json())
  const updates = filter(allUpdates, ['fields.Slack Account', [profile.id]])
  const posts = reverse(orderBy(updates.map(({ id, fields }) => ({
    ...profile,
    postedAt: fields['Post Time'] || '',
    text: fields['Text'] || '',
    attachments: fields['Attachments'] || []
  })), 'postedAt'))

  return posts
}

export default async (req, res) => {
  const profile = await getProfile(req.query.username)
  if (!profile?.id) return res.status(404).json({ status: 404, error: 'Cannot locate user' })
  const posts = await getPosts(profile) || []
  res.json({ profile, posts })
}
