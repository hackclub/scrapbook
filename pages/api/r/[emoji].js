import { map, find, isEmpty, orderBy, filter } from 'lodash'
import { getRawUsers, transformUser } from '../users/index'
import { getRawPosts, transformPost } from '../posts'

export const getPosts = async (emoji, maxRecords = 256) => {
  const users = await getRawUsers(true)
  const allUpdates = await getRawPosts(null, {
    filterByFormula: `FIND(":${emoji}:", ARRAYJOIN({Filtered Emoji Reactions}, ',')) >= 1`,
    maxRecords
  })
  if (!allUpdates) console.error('Could not fetch posts')
  return allUpdates
    .map(p => {
      const user = find(users, { id: p.fields['Slack Account']?.[0] }) || {}
      p.user = user.id ? transformUser(user) : null
      return p
    })
    .filter(p => !isEmpty(p.user))
    .map(({ id, user, fields }) => transformPost(id, fields, user))
}

export default async (req, res) => {
  const { emoji } = req.query
  if (!emoji)
    return res.status(404).json({ status: 404, error: 'Missing emoji name' })
  const posts = (await getPosts(emoji, 1024)) || []
  res.json(posts)
}
