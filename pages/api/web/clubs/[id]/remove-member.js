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
  let clubs = session?.user.ClubMember.filter(x => x.admin).map(x => x.clubId)
  if (clubs.includes(req.query.id)) {
    let newMember = await prisma.ClubMember.delete({
      where: {
        id: req.query.member
      }
    })
    return res.redirect(`/clubs/${req.query.slug}`)
  }
  return res.json({ error: 'No permissions.' })
}
