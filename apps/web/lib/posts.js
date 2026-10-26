import { find, compact } from 'lodash-es'
import { getRawUsers } from './users'
import prisma from './prisma'
import { publicProfile } from './public-profile'
import { postLimit } from './pagination'

export function exclude(object, keys) {
  if (!object) return {}
  return Object.entries(object).reduce((filteredObject, [key, value]) => {
    if (!keys.includes(key)) {
      filteredObject[key] = value
    }

    return filteredObject
  }, {})
}

const isBrokenMediaURL = value =>
  typeof value === 'string' &&
  /^https?:\/\//.test(value) &&
  /(?:^|[-_/])undefined(?:$|[./?])/i.test(value)

export const getRawPosts = async (max = null, params = {}, api = false) => {
  const opts = {
    orderBy: {
      postTime: 'desc'
    },
    include: {
      emojiReactions: {
        include: {
          EmojiType: true
        }
      }
    },
    ...params,
    where: {
      NOT: {
        accountsID: null
      },
      ...params?.where
    }
  }
  opts.take = postLimit(max)
  try {
    return await prisma.updates.findMany(opts)
  } catch (err) {
    throw Error(err)
  }
}

export const formatTS = ts => (ts ? new Date(ts * 1000).toISOString() : null)

export const transformReactions = (raw = []) =>
  compact(
    raw.map(emoji => {
      try {
        const { name, emojiSource } = emoji.EmojiType
        if (name === 'aom') return null
        const obj = { name, usersReacted: emoji.usersReacted }
        obj[emojiSource.startsWith('http') ? 'url' : 'char'] = emojiSource
        return obj
      } catch {
        return null
      }
    })
  )

export const transformPost = p => ({
  id: p.id,
  user: publicProfile(
    p.user
      ? {
          ...p.user,
          avatar: isBrokenMediaURL(p.user.avatar) ? null : p.user.avatar
        }
      : {}
  ),
  timestamp: p.messageTimestamp || null,
  slackUrl: p.messageTimestamp
    ? `https://hackclub.slack.com/archives/${p.channel}/p${p.messageTimestamp
        .toString()
        .replace('.', '')
        .padEnd(16, '0')}`
    : null,
  postedAt: p.messageTimestamp
    ? formatTS(p.messageTimestamp)
    : new Date(p.postTime).toISOString(),
  text: p.text != null ? p.text : '',
  attachments: Array.isArray(p.attachments)
    ? p.attachments.filter(
        url => typeof url === 'string' && !isBrokenMediaURL(url)
      )
    : [],
  mux: Array.isArray(p.muxPlaybackIDs)
    ? p.muxPlaybackIDs.filter(
        id => typeof id === 'string' && id.trim().length > 0
      )
    : [],
  reactions: transformReactions(p.emojiReactions) || []
})

export const getPosts = async (where = {}, max = null, api = false) => {
  const users = await getRawUsers()
  try {
    const posts = await getRawPosts(max, { where }, api).then(posts =>
      posts
        .map(p => {
          p.user = find(
            users,
            p.accountsID ? { id: p.accountsID } : { slackID: p.accountsSlackID }
          )
          return p
        })
        .map(p => transformPost(p))
    )
    return posts
  } catch (e) {
    throw Error(e)
  }
}
