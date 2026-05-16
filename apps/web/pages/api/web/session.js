import { getServerAuthSession } from '../../../lib/auth-session'

export default async function handler(req, res) {
  const session = await getServerAuthSession(req)

  if (!session) {
    return res.status(401).json({ error: true, message: 'Unauthorized' })
  }

  return res.json({ user: session.user })
}
