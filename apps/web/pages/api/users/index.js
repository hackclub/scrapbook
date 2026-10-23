import prisma from '../../../lib/prisma'
import { transformProfile } from './[username]/index'
import { postLimit } from '../../../lib/pagination'

export const getRawUsers = async (
  where = undefined,
  include = undefined,
  take = undefined
) => {
  try {
    const users = await prisma.accounts.findMany({ where, include, take })
    return users
  } catch (err) {
    throw Error(err)
  }
}

// Find users with at least one Scrapbook post
export default async (req, res) => {
  try {
    const rawUsers = await getRawUsers(
      {
        NOT: {
          updates: {
            none: {}
          }
        }
      },
      undefined,
      postLimit(req.query?.max)
    )

    const users = rawUsers.map(transformProfile)
    res.json(users)
  } catch {
    res.status(404).json([])
  }
}
