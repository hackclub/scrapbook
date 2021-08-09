import prisma from '../../../lib/prisma'

export const getRawUsers = (onlyFull = false) =>
  prisma.accounts.findMany(onlyFull ? { where: { fullSlackMember: true } } : {})

export const getProfiles = () => getRawUsers()

export default async (req, res) => getProfiles().then(u => res.json(u || []))
