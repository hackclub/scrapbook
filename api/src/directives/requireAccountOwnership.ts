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
  directive @requireAccountOwnership(roles: [String]) on FIELD_DEFINITION
`

type requireAccountOwnershipValidate = ValidatorDirectiveFunc<{
  table: string
  roles?: string[]
}>

const validate: requireAccountOwnershipValidate = async ({ args, context }) => {
  if (args.id != context.currentUser.id) {
    throw new ForbiddenError("You don't have access to do that.")
  }
}

const requireAccountOwnership = createValidatorDirective(schema, validate)

export default requireAccountOwnership
