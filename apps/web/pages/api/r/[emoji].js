import { map, find, isEmpty, orderBy, filter } from 'lodash-es'
import { getRawUsers } from '../users/index'
import { getRawPosts, transformPost } from '../posts'

const DEFAULT_MAX_RECORDS = 200
const HARD_MAX_RECORDS = 300

const parseMaxRecords = value => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_MAX_RECORDS
  return Math.min(Math.floor(parsed), HARD_MAX_RECORDS)
}

const isBrokenMediaURL = value =>
  typeof value === 'string' &&
  /^https?:\/\//.test(value) &&
  /(?:^|[-_/])undefined(?:$|[./?])/i.test(value)

const sanitizePost = post => ({
  ...post,
  user: {
    ...post.user,
    avatar: isBrokenMediaURL(post?.user?.avatar) ? null : post?.user?.avatar
  },
  attachments: Array.isArray(post.attachments)
    ? post.attachments.filter(url => typeof url === 'string' && !isBrokenMediaURL(url))
    : []
})

export const getPosts = async (emoji, maxRecords = DEFAULT_MAX_RECORDS, where = {}) => {
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
      .map(sanitizePost)

  } catch (err) {
    // console.error(err)
    throw new Error(err);
  }
}

export default async (req, res) => {
  const { emoji } = req.query
  const maxRecords = parseMaxRecords(req.query?.max)
  if (!emoji)
    return res.status(404).json({ status: 404, error: 'Missing emoji name' })
  try {
    const posts =
      (await getPosts(
        emoji,
        maxRecords,
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
