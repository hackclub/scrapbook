import type {
  QueryResolvers,
  MutationResolvers,
  ClubUpdateRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const clubUpdates: QueryResolvers['clubUpdates'] = () => {
  return db.clubUpdate.findMany()
}

export const clubUpdate: QueryResolvers['clubUpdate'] = ({ id }) => {
  return db.clubUpdate.findUnique({
    where: { id },
  })
}

export const createClubUpdate: MutationResolvers['createClubUpdate'] = ({
  input,
}) => {
  return db.clubUpdate.create({
    data: input,
  })
}

export const updateClubUpdate: MutationResolvers['updateClubUpdate'] = ({
  id,
  input,
}) => {
  return db.clubUpdate.update({
    data: input,
    where: { id },
  })
}

export const deleteClubUpdate: MutationResolvers['deleteClubUpdate'] = ({
  id,
}) => {
  return db.clubUpdate.delete({
    where: { id },
  })
}

export const ClubUpdate: ClubUpdateRelationResolvers = {
  update: (_obj, { root }) => {
    return db.clubUpdate.findUnique({ where: { id: root?.id } }).update()
  },
  club: (_obj, { root }) => {
    return db.clubUpdate.findUnique({ where: { id: root?.id } }).club()
  },
}
