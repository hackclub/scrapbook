import type {
  QueryResolvers,
  MutationResolvers,
  UpdateRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const getDayFromISOString = (ISOString) => {
  const date = new Date(ISOString)
  try {
    date.setHours(date.getHours() - 4)
    ISOString = date.toISOString()
  } catch {}
  try {
    const month = ISOString.split('-')[1]
    const day = ISOString.split('-')[2].split('T')[0]
    console.log(month)
    console.log(day)
    return `${month}-${day}`
  } catch {
    console.log(`This is the user's first post!`)
  }
}

export const getNow = (tz) => {
  const date = new Date().toLocaleString('en-US', { timeZone: tz })
  return new Date(date).toISOString()
}

const shouldUpdateStreak = async (userId, timezone, increment, latestUpdates) => {
  const now = getNow(timezone)
  const createdTime = increment
    ? latestUpdates[1]?.postTime
    : latestUpdates[0]?.postTime
  const nowDay = getDayFromISOString(now)
  const createdTimeDay = getDayFromISOString(createdTime)
  return (
    nowDay != createdTimeDay ||
    (increment ? !latestUpdates[1] : !latestUpdates[0])
  )
}

export const updates: QueryResolvers['updates'] = ({ filter }) => {
  console.log(filter)
  if (filter.emojiReactions.some?.emojiTypeName == undefined) {
    filter = { Accounts: filter.Accounts }
  }
  return db.update.findMany({
    include: {
      Accounts: true,
      emojiReactions: { include: { EmojiType: true } },
    },
    orderBy: {
      postTime: 'desc',
    },
    where: filter,
  })
}

export const update: QueryResolvers['update'] = ({ id }) => {
  return db.update.findUnique({
    where: { id },
  })
}

export const createUpdate: MutationResolvers['createUpdate'] = async ({
  input,
}) => {
  let result = await db.$transaction([
    db.update.create({
      data: input,
    }),
    db.account.findUnique({
      where: { id: input.accountsID },
      include: {
        updates: {
          select: {
            postTime: true,
          },
          orderBy: {
              postTime: 'desc'
          }
        },
      },
    }),
  ])
  if(shouldUpdateStreak(result[1].id, result[1].timezone, true, result[1].updates)){
    await db.account.update({
      where: {
        id: result[1].id
      },
      data: {
        streakCount: {
          increment: 1
        }
      }
    })
  }
  return result[0]
}

export const updateUpdate: MutationResolvers['updateUpdate'] = ({
  id,
  input,
}) => {
  return db.update.update({
    data: input,
    where: { id },
  })
}

export const deleteUpdate: MutationResolvers['deleteUpdate'] = ({ id }) => {
  return db.update.delete({
    where: { id },
  })
}

export const Update: UpdateRelationResolvers = {
  Accounts: (_obj, { root }) => {
    return db.update.findUnique({ where: { id: root?.id } }).Accounts()
  },
  emojiReactions: (_obj, { root }) => {
    return db.update.findUnique({ where: { id: root?.id } }).emojiReactions()
  },
}
