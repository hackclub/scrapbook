import type {
  QueryResolvers,
  MutationResolvers,
  EmojiTypeRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const emojiTypes: QueryResolvers['emojiTypes'] = () => {
  return db.emojiType.findMany()
}

export const emojiType: QueryResolvers['emojiType'] = ({ id }) => {
  return db.emojiType.findUnique({
    where: { id },
  })
}

export const createEmojiType: MutationResolvers['createEmojiType'] = ({
  input,
}) => {
  return db.emojiType.create({
    data: input,
  })
}

export const updateEmojiType: MutationResolvers['updateEmojiType'] = ({
  id,
  input,
}) => {
  return db.emojiType.update({
    data: input,
    where: { id },
  })
}

export const deleteEmojiType: MutationResolvers['deleteEmojiType'] = ({
  id,
}) => {
  return db.emojiType.delete({
    where: { id },
  })
}

export const EmojiType: EmojiTypeRelationResolvers = {
  emojiReactions: (_obj, { root }) => {
    return db.emojiType.findUnique({ where: { id: root?.id } }).emojiReactions()
  },
}
