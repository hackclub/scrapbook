import gql from 'graphql-tag'

import {
  createValidatorDirective,
  ForbiddenError,
  ValidatorDirectiveFunc,
} from '@redwoodjs/graphql-server'
import { db } from 'src/lib/db'
import { Club, ClubMember } from 'types/graphql'

export const schema = gql`
  """
  Use to check whether or not a user is the owner of this content
  or has a certain role that bypasses that requirement
  """
  directive @requireClubAdmin on FIELD_DEFINITION
`

type requireClubAdminValidate = ValidatorDirectiveFunc<{
  table: string
  roles?: string[]
}>

const validate: requireClubAdminValidate = async ({ args, context }) => {
  let club = await db.club.findUnique({
    where: {
      id: args.id,
    },
    include: {
      members: true,
    },
  })
  if (
    !club.members
      .filter((x) => x.admin)
      .map((x) => x.accountId)
      .includes(context.currentUser.id)
  ) {
    throw new ForbiddenError("You don't have access to do that.")
  }
}

const requireClubAdmin = createValidatorDirective(schema, validate)

export default requireClubAdmin
