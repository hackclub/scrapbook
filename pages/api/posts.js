import { find, reverse, orderBy } from 'lodash'
import { getRawUsers } from './users'

export const getRawPosts = () =>
  fetch(
    'https://api2.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Updates'
  ).then(r => r.json())

export const getPosts = async () => {
  let posts = await getRawPosts()
  const users = await getRawUsers()
  posts = posts.map(u => {
    u.user = find(users, { id: u.fields['Slack Account']?.[0] }) || {}
    return u
  })
  posts = posts.map(({ id, user, fields }) => ({
    id,
    username: user?.fields['Username'] || '',
    streakDisplay: user?.fields['Display Streak'] || false,
    streakCount: user?.fields['Streak Count'] || 1,
    postedAt: fields['Post Time'] || '',
    text: fields['Text'] || '',
    attachments: fields['Attachments'] || []
  }))
  posts = reverse(orderBy(posts, 'postedAt'))
  return posts
}

export default async (req, res) => {
  const posts = await getPosts()
  res.json(posts)
}
