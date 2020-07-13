import { find, reverse, orderBy, compact, isEmpty } from 'lodash'
import { getRawUsers, transformUser } from './users'
import { stripColons } from '../../lib/emoji'

export const getRawPosts = async (max = null, params = {}) => {
  const opts = {
    sort: [{ field: 'Message Timestamp', direction: 'desc' }],
    ...params
  }
  if (max) opts.maxRecords = max
  return await fetch(
    'https://airbridge.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Updates?select=' +
      JSON.stringify(opts)
  ).then(r => r.json())
}

export const formatTS = ts => (ts ? new Date(ts * 1000).toISOString() : null)

export const transformReactions = (raw = []) =>
  compact(
    raw.map(str => {
      try {
        const parts = str.split(' ')
        const name = stripColons(parts[0])
        if (name === 'summer-of-making') return null
        const obj = { name }
        obj[parts[1]?.startsWith('http') ? 'url' : 'char'] = parts[1]
        return obj
      } catch (e) {
        return null
      }
    })
  )

export const transformPost = (id = null, fields = {}, user = null) => ({
  id,
  user,
  timestamp: fields['Message Timestamp'] || null,
  postedAt: formatTS(fields['Message Timestamp']),
  text: fields['Text'] || '',
  attachments: fields['Attachments'] || [],
  mux: fields['Mux Playback IDs']?.split(' ') || [],
  reactions: transformReactions(fields['Filtered Emoji Reactions']) || []
})

export const getPosts = async (max = null) => {
  const users = await getRawUsers(true)
  return await getRawPosts(max).then(posts =>
    posts
      .map(p => {
        const user = find(users, { id: p.fields['Slack Account']?.[0] }) || {}
        p.user = user?.fields ? transformUser(user) : null
        return p
      })
      .filter(p => !isEmpty(p.user))
      .map(({ id, user, fields }) => transformPost(id, fields, user))
  )
}

export default async (req, res) => {
  const posts = await getPosts(req.query.max ? Number(req.query.max) : 200)
  return res.json(posts)
}
