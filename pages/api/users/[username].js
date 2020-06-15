import { find, reverse, orderBy, filter } from 'lodash'
import { getRawUsers, transformUser } from './index'

export const getProfile = async (username) => {
  const accounts = await getRawUsers()
  if (!accounts) console.error('Could not fetch accounts')
  const user = find(accounts, ['fields.Username', username]) || {}
  // console.log('User', user)
  return user && user?.fields?.Username ? transformUser(user) : {}
}

export const getPosts = async (user) => {
  const allUpdates = await fetch(
    'https://airbridge.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Updates'
  ).then(r => r.json())
  if (!allUpdates) console.error('Could not fetch posts')
  const updates = filter(allUpdates, ['fields.Slack Account', [user.id]])
  const posts = reverse(orderBy(updates.map(({ id, fields }) => ({
    id,
    postedAt: fields['Post Time'] || '',
    text: fields['Text'] || '',
    attachments: fields['Attachments'] || [],
    mux: fields['Mux Playback IDs']?.split(' ') || []
  })), 'postedAt'))

  return posts
}

export default async (req, res) => {
  const profile = await getProfile(req.query.username)
  if (!profile?.id) return res.status(404).json({ status: 404, error: 'Cannot locate user' })
  const posts = await getPosts(profile) || []
  res.json({ profile, posts })
}
