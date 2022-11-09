import type {
  QueryResolvers,
  MutationResolvers,
  ClubRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const clubs: QueryResolvers['clubs'] = () => {
  return db.club.findMany()
}

export const club: QueryResolvers['club'] = ({ id }) => {
  return db.club.findUnique({
    where: { id },
  })
}

export const createClub: MutationResolvers['createClub'] = ({ input }) => {
  return db.club.create({
    data: input,
  })
}

export const updateClub: MutationResolvers['updateClub'] = ({ id, input }) => {
  return db.club.update({
    data: input,
    where: { id },
  })
}

export const deleteClub: MutationResolvers['deleteClub'] = ({ id }) => {
  return db.club.delete({
    where: { id },
  })
}

export const Club: ClubRelationResolvers = {
  members: (_obj, { root }) => {
    return db.club.findUnique({ where: { id: root?.id } }).members()
  },
  updates: (_obj, { root }) => {
    return db.club.findUnique({ where: { id: root?.id } }).updates()
  },
}
