import type {
  QueryResolvers,
  MutationResolvers,
  UpdateRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

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
        },
      },
    }),
  ])
  const getDayOfDate = (date) =>
    Math.floor(
      new Date(
        new Date(date).valueOf() +
          (result[1].timezoneOffset - 4) * 60 * 60 * 1000
      ).valueOf() / 8.64e7
    )
  let streak = 0
  let currentDay = getDayOfDate(new Date())
  let updatesArray = result[1].updates.sort(function (a, b) {
    return new Date(b.postTime).valueOf() - new Date(a.postTime).valueOf()
  })
  if (getDayOfDate(updatesArray[0].postTime) == currentDay) {
    streak = 1
  }
  updatesArray.map((update) => {
    if (getDayOfDate(update.postTime) - currentDay == -1) {
      streak += 1
      currentDay -= 1
    }
  })
  console.log(streak)
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
