import { requireServerAuthSession } from '../../../../../lib/auth-session'
import prisma from '../../../../../lib/prisma'

export default async (req, res) => {
  const session = await requireServerAuthSession(req, res)
  if (!session) return
  if (typeof req.body?.member !== 'string' || !req.body.member) {
    return res
      .status(400)
      .json({ error: true, message: 'Invalid membership id' })
  }
  let clubs = session?.user.ClubMember.filter(x => x.admin).map(x => x.clubId)
  if (clubs.includes(req.query.id)) {
    const result = await prisma.clubMember.deleteMany({
      where: {
        id: req.body.member,
        clubId: req.query.id
      }
    })
    if (!result.count) return res.status(404).json({ error: true })
    return res.json({ deleted: true })
  }
  return res.status(403).json({ error: true })
}
