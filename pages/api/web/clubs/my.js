import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import prisma from '../../../../lib/prisma'
import metrics from "../../../../metrics";

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
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

    metrics.increment("success.get_my_clubs", 1);
    return res.json({ clubs, others })
  }
  catch {
    metrics.increment("errors.get_my_clubs", 1);
    return res.json({ clubs: [], others: [] })
  }
}
