import type {
  QueryResolvers,
  MutationResolvers,
  ClubMemberRelationResolvers,
} from 'types/graphql'

import { db } from 'src/lib/db'

export const clubMembers: QueryResolvers['clubMembers'] = () => {
  return db.clubMember.findMany()
}

export const clubMember: QueryResolvers['clubMember'] = ({ id }) => {
  return db.clubMember.findUnique({
    where: { id },
  })
}

export const createClubMember: MutationResolvers['createClubMember'] = ({
  input,
}) => {
  return db.clubMember.create({
    data: {
      account: {
        connect: {
          id: input.accountId
        }
      },
      club: {
        connect: {
          slug: input.clubSlug
        }
      }
    },
  })
}

export const updateClubMember: MutationResolvers['updateClubMember'] = ({
  id,
  input,
}) => {
  return db.clubMember.update({
    data: input,
    where: { id },
  })
}

export const deleteClubMember: MutationResolvers['deleteClubMember'] = ({
  id,
}) => {
  return db.clubMember.delete({
    where: { id },
  })
}

export const ClubMember: ClubMemberRelationResolvers = {
  account: (_obj, { root }) => {
    return db.clubMember.findUnique({ where: { id: root?.id } }).account()
  },
  club: (_obj, { root }) => {
    return db.clubMember.findUnique({ where: { id: root?.id } }).club()
  },
}
