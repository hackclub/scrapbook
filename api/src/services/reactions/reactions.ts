import type {
  QueryResolvers,
  MutationResolvers,
  ReactionRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const reactions: QueryResolvers['reactions'] = () => {
  return db.reaction.findMany({ include: { emoji: true } })
}

export const reaction: QueryResolvers['reaction'] = ({ id }) => {
  return db.reaction.findUnique({
    where: { id },
  })
}

export const createReaction: MutationResolvers['createReaction'] = ({
  input,
}) => {
  return db.reaction.create({
    data: input,
  })
}

export const updateReaction: MutationResolvers['updateReaction'] = ({
  id,
  input,
}) => {
  return db.reaction.update({
    data: input,
    where: { id },
  })
}

export const deleteReaction: MutationResolvers['deleteReaction'] = ({
  id,
}) => {
  return db.reaction.delete({
    where: { id },
  })
}

export const Reaction: ReactionRelationResolvers = {
  emoji: (_obj, { root }) => {
    return db.reaction.findUnique({ where: { id: root?.id } }).emoji()
  },
  update: (_obj, { root }) => {
    return db.reaction.findUnique({ where: { id: root?.id } }).update()
  },
}
