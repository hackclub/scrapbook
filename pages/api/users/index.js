import prisma from '../../../lib/prisma'
import { transformProfile } from './[username]/index.js'

export const getRawUsers = (onlyFull = false, where = undefined) =>
  prisma.accounts.findMany({ where })

// Find users with at least one Scrapbook post
export default async (req, res) =>
  getRawUsers(
    false,        
    {
      NOT: {
        updates: {
          none: {}
        }
      }
    }
  ).then(u => res.json(u.map(x => transformProfile(x) || []))
