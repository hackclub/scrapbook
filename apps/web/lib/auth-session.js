import { fromNodeHeaders } from 'better-auth/node'
import { auth } from './auth'
import prisma from './prisma'

const accountInclude = {
  ClubMember: {
    include: {
      club: true
    }
  }
}

export async function getServerAuthSession(req) {
  const authSession = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  })

  if (!authSession?.user?.id) return null

  const user = await prisma.accounts.findUnique({
    where: { id: authSession.user.id },
    include: accountInclude
  })

  if (!user) return null

  return {
    ...authSession.session,
    user
  }
}

export async function requireServerAuthSession(req, res) {
  const session = await getServerAuthSession(req)

  if (!session?.user) {
    res.status(401).json({ error: true, message: 'Unauthorized' })
    return null
  }

  return session
}

export async function requireVerifiedWebUser(req, res) {
  const session = await requireServerAuthSession(req, res)

  if (!session) return null

  if (session.user.verificationStatus !== 'verified') {
    res.status(403).json({
      error: true,
      message: 'Identity verification is required to post on Scrapbook.'
    })
    return null
  }

  return session
}
