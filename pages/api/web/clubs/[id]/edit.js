import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]'
import prisma from '../../../../../lib/prisma'
import GithubSlugger from 'github-slugger'
import normalizeUrl from 'normalize-url'

const slugger = new GithubSlugger()

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)
  if (session?.user === undefined) {
    res.json({ error: true })
  }
  try {
    let id = req.body.id
    delete req.body.id
    let club = await prisma.club.update({
      where: {
        id
      },
      data: {
        ...req.body,
        members: undefined,
        website:
          req.body?.website != '' && req.body?.website
            ? normalizeUrl(req.body.website, { forceHttps: true })
            : null
      }
    })
    res.json({ club })
  } catch (e) {
    console.error(e)
    res.json({ error: true })
  }
}
