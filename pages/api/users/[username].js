import { map, find, reverse, orderBy, filter } from 'lodash'
import { getRawUsers, transformUser } from './index'
import { getRawPosts, transformPost } from '../posts'

export const getProfile = async (value, field = 'Username') => {
  const opts = JSON.stringify({
    maxRecords: 1,
    filterByFormula: `${
      field === 'id' ? 'RECORD_ID()' : `{${field}}`
    } = "${value}"`
  })
  const user = await fetch(
    `https://airbridge.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Slack%20Accounts?select=${opts}`
  )
    .then(r => r.json())
    .then(a => (Array.isArray(a) ? a[0] : null))
  if (!user) console.error('Could not fetch account', value)
  return user && user?.fields?.Username ? transformUser(user) : {}
}

export const getPosts = async user => {
  const allUpdates = await getRawPosts(null, {
    filterByFormula: `{Username} = "${user.username}"`
  })
  if (!allUpdates) console.error('Could not fetch posts')
  let updates = filter(allUpdates, [
    'fields.Slack Account',
    [user.id]
  ]).map(({ id, fields }) => transformPost(id, fields))

  return updates
}

export default async (req, res) => {
  const profile = await getProfile(req.query.username)
  if (!profile?.id)
    return res.status(404).json({ status: 404, error: 'Cannot locate user' })
  let webring = []
  if (profile.webring) {
    webring = await Promise.all(
      profile.webring.map(async id => await getProfile(id, 'id'))
    )
  }
  const posts = (await getPosts(profile)) || []
  res.json({ profile, webring, posts })
}
