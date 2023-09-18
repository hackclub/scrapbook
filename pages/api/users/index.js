import prisma from '../../../lib/prisma'
import { transformProfile } from './[username]/index'

export const getRawUsers = async (
  where = undefined,
  include = undefined,
  take = undefined
) => {
  try {
    const users = await prisma.accounts.findMany({ where, include, take })
    return users;
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
      Number(req.query?.max) || undefined
    );

    const users = rawUsers.map(transformProfile);
    res.json(users);
  } catch {
    res.status(404).json([]);
  }
}
