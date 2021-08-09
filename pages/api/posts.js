import { find, compact, isEmpty } from 'lodash'
import { getRawUsers } from './users'
import { stripColons } from '../../lib/emoji'
import prisma from '../../lib/prisma'

export const getRawPosts = async (max = null, params = {}) => {
  const opts = {
    orderBy: {
      messageTimestamp: 'desc'
    },
    include: {
      emojiReactions: {
        include: {
          EmojiType: true
        }
      }
    },
    ...params
  }
  if (max) opts.take = max
  return await prisma.updates.findMany(opts)
}

export const formatTS = ts => (ts ? new Date(ts * 1000).toISOString() : null)

export const transformReactions = (raw = []) =>
  compact(
    raw.map(emoji => {
      try {
        const { name, emojiSource } = emoji.EmojiType
        if (name === 'aom') return null
        const obj = { name }
        obj[emojiSource.startsWith('http') ? 'url' : 'char'] = emojiSource
        return obj
      } catch (e) {
        return null
      }
    })
  )

export const transformPost = p => ({
  id: p.id,
  user: p.user ? p.user : {},
  timestamp: p.messageTimestamp || null,
  slackUrl: `https://hackclub.slack.com/archives/${p.channel}/p1628524815020800`,
  postedAt: formatTS(p.messageTimestamp),
  text: p.text != null ? p.text : '',
  attachments: p.attachments,
  muxPlaybackIDs: p.muxPlaybackIDs,
  reactions: transformReactions(p.emojiReactions) || []
})

export const getPosts = async (max = null) => {
  const users = await getRawUsers(true)
  return await getRawPosts(max).then(posts =>
    posts
      .map(p => {
        p.user = find(users, { slackID: p.accountsSlackID }) || {}
        return p
      })
      .filter(p => !isEmpty(p.user))
      .map(p => transformPost(p))
  )
}

export default async (req, res) => {
  const posts = await getPosts(req.query.max ? Number(req.query.max) : 200)
  return res.json(posts)
}
