import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import prisma from '../../../../lib/prisma'

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)
  if (session?.user === undefined) {
    return res.json({ error: true })
  }
  try {
    let account = await prisma.accounts.update({
      where: {
        id: session.user.id
      },
      data: {
        username: req.body.username,
        email: req.body.email,
        website: req.body.website,
        pronouns: req.body.pronouns,
        cssURL: req.body.cssURL ?
          req.body.cssURL?.includes('http://') ||
          req.body.cssURL?.includes('https://') ||
          req.body.cssURL == ''
            ? req.body.cssURL
            : 'http://'.concat(req.body.cssURL) : null,
        website: req.body.website ?
          req.body.website?.includes('http://') ||
          req.body.website?.includes('https://') ||
          req.body.website == ''
            ? req.body.website
            : 'http://'.concat(req.body.website) : null,
        github: req.body.github ?
          req.body.github?.includes('https://') ||
          req.body.github?.includes('http://') ||
          req.body.github == ''
            ? req.body.github
            : 'https://'.concat(req.body.github) : null
      }
    })
    return res.json(account)
  } catch (e) {
    console.error(e)
    return res.json({ error: true })
  }
}
