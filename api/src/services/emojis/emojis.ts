import type {
  QueryResolvers,
  MutationResolvers,
  EmojiRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const emojis: QueryResolvers['emojis'] = () => {
  return db.emoji.findMany()
}

export const emoji: QueryResolvers['emoji'] = ({ id }) => {
  return db.emoji.findUnique({
    where: { id },
  })
}

export const createEmoji: MutationResolvers['createEmoji'] = ({ input }) => {
  return db.emoji.create({
    data: input,
  })
}

export const updateEmoji: MutationResolvers['updateEmoji'] = ({
  id,
  input,
}) => {
  return db.emoji.update({
    data: input,
    where: { id },
  })
}

export const deleteEmoji: MutationResolvers['deleteEmoji'] = ({ id }) => {
  return db.emoji.delete({
    where: { id },
  })
}

export const Emoji: EmojiRelationResolvers = {
  reactions: (_obj, { root }) => {
    return db.emoji.findUnique({ where: { id: root?.id } }).reactions()
  },
}
