import { getClub } from './index'

export default async (req, res) => {
  const club = await getClub(req.query.username)
  if (!club?.slug)
    return res.status(404).json({ status: 404, error: 'Cannot locate club' })
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=604800'
  )
  res.redirect(club.logo)
}
