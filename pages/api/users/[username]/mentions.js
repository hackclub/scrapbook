import { getProfile, getMentions } from './index'

export default async (req, res) => {
  const profile = await getProfile(req.query.username)
  if (!profile?.slackID)
    return res.status(404).json({ status: 404, error: 'Cannot locate user' })
  const posts = (await getMentions(profile)) || []
  res.json({ profile, posts })
}
