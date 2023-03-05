import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]'
import prisma from '../../../../../lib/prisma'
import GithubSlugger from 'github-slugger'
import normalizeUrl from 'normalize-url'

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)
  if (session?.user === undefined) {
    res.json({ clubs: [] })
  }
  console.log(session?.user)
  let clubs = session?.user.ClubMember.filter(x => x.admin).map(x => x.clubId)
  if (clubs.includes(req.query.id)) {
    let newMember = await prisma.ClubMember.create({
      data: {
        club: {
          connect: {
            id: req.query.id
          }
        },
        account: {
          connect: {
            email: req.query.email
          }
        },
        admin: req.query.admin ? true : false
      },
      include: {
        club: {
          select: {
            slug: true
          }
        }
      }
    })
    return res.redirect(`/clubs/${newMember.club.slug}`)
  }
  return res.json({ error: 'No permissions.' })
}
