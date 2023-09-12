import { map } from 'lodash'
import prisma from '../../lib/prisma'

export const getUsernames = (params = {}) => {
  try {
    const usernames = await prisma.accounts.findMany(params).then(u => map(u, 'username'));
    metrics.increment("success.get_usernames", 1);
    return usernames;
  } catch {
    metrics.increment("errors.get_usernames", 1);
    return [];
  }
}

export default async (req, res) => getUsernames().then(u => res.json(u || []))
