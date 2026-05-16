import { requireServerAuthSession } from '../../../../../lib/auth-session'
import prisma from '../../../../../lib/prisma'
import GithubSlugger from 'github-slugger'

export default async (req, res) => {
  const session = await requireServerAuthSession(req, res)
  if (!session) return
  let clubs = session?.user.ClubMember.filter(x => x.admin).map(x => x.clubId)
  if (clubs.includes(req.query.id)) {
    await prisma.ClubMember.delete({
      where: {
        id: req.body.member
      }
    })
    return res.json({ deleted: true })
  }
  return res.json({ error: true })
}
