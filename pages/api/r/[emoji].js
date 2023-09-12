import { map, find, isEmpty, orderBy, filter } from 'lodash'
import { getRawUsers } from '../users/index'
import { getRawPosts, transformPost } from '../posts'
import metrics from "../../../metrics";

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
    metrics.increment("success.get_posts_by_emoji", 1);

    return allUpdates
      .map(p => {
        p.user = find(users, { slackID: p.accountsSlackID }) || {}
        return p
      })
      .filter(p => !isEmpty(p.user))
      .map(p => transformPost(p))

  } catch {
    if (!allUpdates) console.error('Could not fetch posts')
    metrics.increment("errors.get_posts_by_emoji", 1);
    return [];
  }


}

export default async (req, res) => {
  const { emoji } = req.query
  if (!emoji)
    return res.status(404).json({ status: 404, error: 'Missing emoji name' })
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
  res.json(posts)
}
