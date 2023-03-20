import prisma from '../../../lib/prisma'
import { transformProfile } from './[username]/index'

export const getRawUsers = (onlyFull = false, where = undefined, take = 100) =>
  prisma.accounts.findMany({ where, take })

// Find users with at least one Scrapbook post
export default async (req, res) =>
  getRawUsers(
    false,        
    undefined,
    100
  ).then(u => res.json(u.map(transformProfile) || []))
