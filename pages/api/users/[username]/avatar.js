import { transformUser } from '../index'

export const getProfile = async (value, field = 'Username') => {
  const opts = JSON.stringify({
    maxRecords: 1,
    filterByFormula: `${
      field === 'id' ? 'RECORD_ID()' : `{${field}}`
    } = "${value}"`
  })
  const user = await fetch(
    `https://airbridge.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Slack%20Accounts?select=${opts}`
  )
    .then(r => r.json())
    .then(a => (Array.isArray(a) ? a[0] : null))
  if (!user) console.error('Could not fetch account', value)
  return user && user?.fields?.Username ? transformUser(user) : {}
}

export default async (req, res) => {
  const profile = await getProfile(req.query.username)
  if (!profile?.id)
    return res.status(404).json({ status: 404, error: 'Cannot locate user' })
  res.redirect(profile.avatar)
}
