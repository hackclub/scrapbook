import prisma from '../../../lib/prisma'

export const getRawUsers = (onlyFull = false, where = null) =>
  prisma.accounts.findMany({
    where: null
  })

// Find users with at least one Scrapbook post
export default async (req, res) => getRawUsers(
  false, 
  {
    NOT: {
      updates: {
        none: {}
      }
    }
  }
).then(u => res.json(u || []))
