import prisma from '../../../lib/prisma'

export const getRawUsers = (onlyFull = false) =>
  prisma.accounts.findMany(onlyFull ? { where: { fullSlackMember: true } } : {})

export default async (req, res) => getRawUsers().then(u => res.json(u || []))
