import { getProfile } from '../users/[username]'

export default async (req, res) => {
  const { username } = req.query
  if (!username) {
    return res.status(400).json({ status: 400, error: 'Must provide username' })
  }
  const profile = await getProfile(req.query.username)
  if (!profile?.id) {
    return res.status(404).json({ status: 404, error: 'Cannot locate user' })
  }
  res.json(profile)
}
