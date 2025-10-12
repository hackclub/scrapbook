import { map, find, isEmpty, orderBy, filter } from 'lodash-es'
import { getRawUsers } from '../users/index'
import { getRawPosts, transformPost } from '../posts'

export const getPosts = async (emoji, maxRecords = 256, where = {}) => {
  try {
    const users = await getRawUsers()
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

    return allUpdates
      .map(p => {
        p.user = find(users, { slackID: p.accountsSlackID }) || {}
        return p
      })
      .filter(p => !isEmpty(p.user))
      .map(p => transformPost(p))

  } catch (err) {
    // console.error(err)
    throw new Error(err);
  }
}

export default async (req, res) => {
  const { emoji } = req.query
  if (!emoji)
    return res.status(404).json({ status: 404, error: 'Missing emoji name' })
  try {
    const posts =
      (await getPosts(
        emoji,
        1024,
        emoji == 'summer-of-making'
          ? {
            postTime: {
              lte: new Date(2021, 1)
            }
          }
          : {}
      )) || []
    res.json(posts);
  } catch {
    res.status(404).json([]);
  }

}
