import { find, reverse, orderBy, compact, isEmpty, xorBy } from 'lodash'
import { getRawUsers, transformUser } from './users'
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
      } // Return all fields
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
        console.log(e)
        return null
      }
    })
  )

export const transformPost = (
  id = null,
  user = null,
  messageTimestamp = null,
  channel = 'C01504DCLVD',
  text = '',
  attachments = [],
  muxPlaybackIDs = [],
  emojiReactions = []
) => ({
  id,
  user,
  timestamp: messageTimestamp || null,
  slackUrl: `https://hackclub.slack.com/archives/${channel}/p1628524815020800`,
  postedAt: formatTS(messageTimestamp),
  text: text,
  attachments,
  muxPlaybackIDs,
  reactions: transformReactions(emojiReactions) || []
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
      .map(
        ({
          id,
          user,
          messageTimestamp,
          text,
          channel,
          attachments,
          muxPlaybackIDs,
          emojiReactions
        }) =>
          transformPost(
            id,
            user,
            messageTimestamp,
            text,
            channel,
            attachments,
            muxPlaybackIDs,
            emojiReactions
          )
      )
  )
}

export default async (req, res) => {
  const posts = await getPosts(req.query.max ? Number(req.query.max) : 200)
  return res.json(posts)
}
