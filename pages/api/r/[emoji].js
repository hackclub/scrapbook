import { map, find, isEmpty, orderBy, filter } from 'lodash'
import { getRawUsers } from '../users/index'
import { getRawPosts, transformPost } from '../posts'

export const getPosts = async (emoji, maxRecords = 256, where = {}) => {
  const users = await getRawUsers(true)
  const allUpdates = await getRawPosts(maxRecords, {
    where: {
      emojiReactions: {
        some: {
          emojiTypeName: emoji
        }
      },
      ...where
    }
  })
  if (!allUpdates) console.error('Could not fetch posts')
  return allUpdates
    .map(p => {
      p.user = find(users, { slackID: p.accountsSlackID }) || {}
      return p
    })
    .filter(p => !isEmpty(p.user))
    .map(p => transformPost(p))
}

export default async (req, res) => {
  const { emoji } = req.query
  if (!emoji)
    return res.status(404).json({ status: 404, error: 'Missing emoji name' })
  const posts = (await getPosts(emoji, 1024, emoji == "summer-of-making" ? {
    postTime: {
      lte: new Date(2021, 1)
    }
  } : {}))) || []
  res.json(posts)
}
