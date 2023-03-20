import prisma from '../../../lib/prisma'

export const getRawUsers = (onlyFull = false, where = undefined) =>
  prisma.accounts.findMany({ where })

// Find users with at least one Scrapbook post
export default async (req, res) =>
  getRawUsers(false).then(u => res.json(u.map(x=> ({...x, email: null})) || []))
