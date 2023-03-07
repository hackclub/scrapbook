import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import prisma from '../../../../lib/prisma'
import GithubSlugger from 'github-slugger'
import normalizeUrl from 'normalize-url'

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)
  if (session?.user === undefined) {
    return res.json({ clubs: [] })
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
  return res.json({ clubs: clubs })
}
