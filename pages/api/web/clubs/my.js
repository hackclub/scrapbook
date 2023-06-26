import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import prisma from '../../../../lib/prisma'
import GithubSlugger from 'github-slugger'
import normalizeUrl from 'normalize-url'

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
    return res.json({ clubs, others })
  }
  catch {
    return res.json({ clubs: [], others: [] })
  }  
}
