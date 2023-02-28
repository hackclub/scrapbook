import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import prisma from '../../../../lib/prisma'
import GithubSlugger from 'github-slugger'
import normalizeUrl from 'normalize-url'

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)
  if (session?.user === undefined) {
    res.json({ clubs: [] })
  }
  let clubs = await prisma.club.findMany({
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
  })
  res.json({ clubs: clubs })
}
