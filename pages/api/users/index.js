import prisma from '../../../lib/prisma'

// Find users with at least one Scrapbook post
export const getRawUsers = () =>
  prisma.accounts.findMany({
    where: {
      NOT: {
        updates: {
          none: {}
        }
      }
    }
  })

export default async (req, res) => getRawUsers().then(u => res.json(u || []))
