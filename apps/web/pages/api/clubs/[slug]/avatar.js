import { getClub } from './index'

export default async (req, res) => {
  const club = await getClub(req.query.username)
  if (!club?.slug)
    return res.status(404).json({ status: 404, error: 'Cannot locate club' })
  res.redirect(club.logo)
}
