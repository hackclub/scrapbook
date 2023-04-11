import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]'
import prisma from '../../../../../lib/prisma'
import GithubSlugger from 'github-slugger'
import normalizeUrl from 'normalize-url'

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)
  if (session?.user === undefined) {
    console.error('No user.')
    return res.json({ error: true })
  }
  let clubs = session?.user.ClubMember.filter(x => x.admin).map(x => x.clubId)
  if (clubs.includes(req.query.id)) {
    try {
      let newMember = await prisma.ClubMember.create({
        data: {
          club: {
            connect: {
              id: req.query.id
            }
          },
          account: {
            connectOrCreate: {
              where: {
                email: req.body.email,
              },
              create: {
                email: req.body.email,
                username: `${req.body.email.split("@")[0]}${Math.ceil(Math.random()*1000)}`,
              },
            },
          },
          admin: req.body.admin || false
        },
        include: {
          club: {
            select: {
              slug: true
            }
          }
        }
      })
      return res.json({ newMember })
    } catch (e) {
      console.error(e)
      return res.json({ error: true })
    }
  }
  console.error('Not in club.')
  return res.json({ error: true })
}
