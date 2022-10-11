import type {
  QueryResolvers,
  MutationResolvers,
  UpdateRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const updates: QueryResolvers['updates'] = ({filter}) => {
  return db.update.findMany({
    include: {Accounts: true}, 
    orderBy: {
      postTime: 'desc'
    },
    where: filter
  })
}

export const update: QueryResolvers['update'] = ({ id }) => {
  return db.update.findUnique({
    where: { id },
  })
}

export const createUpdate: MutationResolvers['createUpdate'] = ({ input }) => {
  return db.update.create({
    data: input,
  })
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
