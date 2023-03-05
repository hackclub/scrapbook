import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]'
import prisma from '../../../../../lib/prisma'
import GithubSlugger from 'github-slugger'
import normalizeUrl from 'normalize-url'

const slugger = new GithubSlugger()

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)
  if (session?.user === undefined) {
    res.redirect(`/?errorTryAgain`)
  }
  let id = req.query.id
  delete req.query.id
  let club = await prisma.club.update({
    where: {
      id
    },
    data: {
      ...req.query,
      website:
        req.query.website != ''
          ? normalizeUrl(req.query.website, { forceHttps: true })
          : null
    }
  })
  res.redirect(`/clubs/${club.slug}`)
}
