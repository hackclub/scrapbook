import { map, find, isEmpty, orderBy } from 'lodash'
import { getRawUsers } from '../index'
import { getRawPosts, transformPost } from '../../posts'
import prisma from '../../../../lib/prisma'
import { emailToPfp } from '../../../../lib/email'

export const transformProfile = (profile) => {
  if(profile){
  return {
    ...profile,
    email: null,
    avatar: !profile?.avatar ? emailToPfp(profile?.email) : profile?.avatar
  }
}
else {
  return profile
}
}

export const getProfile = async (value, field = 'username') => {
  let where = {}
  where[field] = value
  const opts = {
    where
  }
  console.log(opts)
  const user = transformProfile(await prisma.accounts.findFirst(opts))
  if (!user) console.error('Could not fetch account', value)
  return user && user?.username ? user : {}
}

export const getPosts = async (user, max = null) => {
  const allUpdates = await getRawPosts(max, {
    where: {
      Accounts: { username: user.username}
    }
  })

  if (!allUpdates) console.error('Could not fetch posts')
  return allUpdates.map(p => transformPost(p))
}

export const getMentions = async user => {
  const users = await getRawUsers(true)
  const allUpdates = await getRawPosts(null, {
    where: {
      text: { contains: `@${user.username}` }
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
  const profile = await getProfile(req.query.username)
  if (!profile?.slackID && !profile?.username)
    return res.status(404).json({ status: 404, error: 'Cannot locate user' })
  let webring = []
  if (profile.webring) {
    webring = await Promise.all(
      profile.webring.map(async id => await getProfile(id, 'slackID'))
    )
  }
  const posts = (await getPosts(profile, req.query.max ? Number(req.query.max) : null)) || []
  res.json({ profile, webring, posts })
}
