import prisma from '../../lib/prisma'

export const getUserStreaks = () =>
  prisma.accounts.findMany({
    where: {
      maxStreaks: {
        gt: 0
      }
    },
    select: {
      username: true,
      avatar: true,
      streakCount: true,
      maxStreaks: true
    }
  })

export default async (req, res) => getUserStreaks().then(u => res.json(u || []))
