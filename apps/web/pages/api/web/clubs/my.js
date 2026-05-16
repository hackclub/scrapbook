import { getServerAuthSession } from '../../../../lib/auth-session'
import prisma from '../../../../lib/prisma'

export default async (req, res) => {
  try {
    const session = await getServerAuthSession(req)
    if (session?.user === undefined) {
      let [others] = await prisma.$transaction([
        prisma.club.findMany({
          include: {
            updates: true,
            members: true
          }
        })
      ])
      return res.json({ clubs: [], others })
    }

    let [clubs, others] = await prisma.$transaction([
      prisma.club.findMany({
        where: {
          members: {
            some: {
              accountId: {
                equals: session.user.id
              }
            }
          }
        },
        include: {
          updates: true,
          members: true
        }
      }),
      prisma.club.findMany({
        where: {
          NOT: {
            members: {
              some: {
                accountId: {
                  equals: session.user.id
                }
              }
            }
          }
        },
        include: {
          updates: true,
          members: true
        }
      })
    ])

    return res.json({ clubs, others })
  }
  catch {
    return res.status(404).json({ clubs: [], others: [] })
  }
}
