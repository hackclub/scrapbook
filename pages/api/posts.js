import { find, reverse, orderBy } from 'lodash'
import { getRawUsers, transformUser } from './users'

export const getRawPosts = () =>
  fetch(
    'https://api2.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Updates'
  ).then(r => r.json())

export const getPosts = async () => {
  let posts = await getRawPosts()
  const users = await getRawUsers()
  posts = posts.map(p => {
    const user = find(users, { id: p.fields['Slack Account']?.[0] }) || {}
    p.user = (user?.fields?.Username) ? {} : transformUser(user)
    return p
  })
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
  res.json(posts)
}
