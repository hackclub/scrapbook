import gql from 'graphql-tag'

import {
  createValidatorDirective,
  ForbiddenError,
  ValidatorDirectiveFunc,
} from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'

export const schema = gql`
  """
  Use to check whether or not a user is the owner of this content
  or has a certain role that bypasses that requirement
  """
  directive @requireUpdateOwnership(roles: [String]) on FIELD_DEFINITION
`

type requireUpdateOwnershipValidate = ValidatorDirectiveFunc<{
  table: string
  roles?: string[]
}>

const validate: requireUpdateOwnershipValidate = async ({ args, context }) => {
  console.log('Look here!')
  let item = await db.update.findUnique({
    where: {
      id: String(args.id),
    },
  })
  if (item.accountsID != context.currentUser.id) {
    throw new ForbiddenError("You don't have access to do that.")
  }
}

const requireUpdateOwnership = createValidatorDirective(schema, validate)

export default requireUpdateOwnership
