import { find, reverse, orderBy, isEmpty } from 'lodash'
import { getRawUsers, transformUser } from './users'
import { allowAllOrigins } from '../../lib/api'

export const getRawPosts = () =>
  fetch(
    'https://airbridge.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Updates'
  ).then(r => r.json())

export const getPosts = async () => {
  let posts = await getRawPosts()
  const users = await getRawUsers(false)
  posts = posts
    .map(p => {
      const user = find(users, { id: p.fields['Slack Account']?.[0] }) || {}
      p.user = user?.fields ? transformUser(user) : null
      return p
    })
    .filter(p => !isEmpty(p.user))
  posts = posts.map(({ id, user, fields }) => ({
    id,
    user,
    postedAt: fields['Post Time'] || '',
    text: fields['Text'] || '',
    attachments: fields['Attachments'] || [],
    mux: fields['Mux Playback IDs']?.split(' ') || []
  }))
  posts = reverse(orderBy(posts, 'postedAt'))
  return posts
}

export default async (req, res) => {
  const posts = await getPosts()
  allowAllOrigins(res).json(posts)
}
