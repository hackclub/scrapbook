import type {
  QueryResolvers,
  MutationResolvers,
  EmojiReactionRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const emojiReactions: QueryResolvers['emojiReactions'] = () => {
  return db.emojiReaction.findMany({ include: { EmojiType: true } })
}

export const emojiReaction: QueryResolvers['emojiReaction'] = ({ id }) => {
  return db.emojiReaction.findUnique({
    where: { id },
  })
}

export const createEmojiReaction: MutationResolvers['createEmojiReaction'] = ({
  input,
}) => {
  return db.emojiReaction.create({
    data: input,
  })
}

export const updateEmojiReaction: MutationResolvers['updateEmojiReaction'] = ({
  id,
  input,
}) => {
  return db.emojiReaction.update({
    data: input,
    where: { id },
  })
}

export const deleteEmojiReaction: MutationResolvers['deleteEmojiReaction'] = ({
  id,
}) => {
  return db.emojiReaction.delete({
    where: { id },
  })
}

export const EmojiReaction: EmojiReactionRelationResolvers = {
  EmojiType: (_obj, { root }) => {
    return db.emojiReaction.findUnique({ where: { id: root?.id } }).EmojiType()
  },
  update: (_obj, { root }) => {
    return db.emojiReaction.findUnique({ where: { id: root?.id } }).update()
  },
}
