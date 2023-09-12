import prisma from '../../../lib/prisma'
import { transformProfile } from './[username]/index'
import metrics from "../../../metrics";

export const getRawUsers = async (
  where = undefined,
  include = undefined,
  take = undefined
) => {
  try {
    const users = await prisma.accounts.findMany({ where, include, take })
    metrics.increment("success.get_raw_users", 1);
    return users;
  } catch {
    metrics.increment("errors.get_raw_users", 1);
    return [];
  }
}

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
