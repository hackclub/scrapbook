import { map } from 'lodash'
import prisma from '../../lib/prisma'

export const getUsernames = async (params = {}) => {
  try {
    const usernames = await prisma.accounts.findMany(params).then(u => map(u, 'username'));
    return usernames;
  } catch {
    throw Error("Failed to get usernames");
  }
}

export default async (req, res) => {
  try {
    const usernames = getUsernames();
    res.json(usernames);
  } catch {
    res.status(404).json([]);
  }
}
