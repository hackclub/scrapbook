import prisma from '../../../lib/prisma'
import { transformProfile } from './[username]/index'

export const getRawUsers = async (
  where = undefined,
  include = undefined,
  take = undefined
) => prisma.accounts.findMany({ where, include, take })

// Find users with at least one Scrapbook post
export default async (req, res) =>
  getRawUsers(
    {
      NOT: {
        updates: {
          none: {}
        }
      }
    },
    undefined,
    Number(req.query?.max) || undefined
  ).then(u => res.json(u.map(transformProfile) || []))
