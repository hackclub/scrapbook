import prisma from './prisma'
import { publicProfile } from './public-profile'

export const getRawUsers = async (
  where = undefined,
  include = undefined,
  take = undefined
) => {
  try {
    return await prisma.accounts.findMany({ where, include, take })
  } catch (err) {
    throw Error(err)
  }
}

export const transformProfile = publicProfile
