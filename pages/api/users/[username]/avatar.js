import { getProfile } from './index'

export default async (req, res) => {
  const profile = await getProfile(req.query.username)
  if (!profile?.slackID)
    return res.status(404).json({ status: 404, error: 'Cannot locate user' })
  res.redirect(profile.avatar)
}
