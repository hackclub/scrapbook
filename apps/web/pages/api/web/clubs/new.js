import { requireServerAuthSession } from '../../../../lib/auth-session'
import prisma from '../../../../lib/prisma'
import GithubSlugger from 'github-slugger'

const slugger = new GithubSlugger()

export default async (req, res) => {
  const session = await requireServerAuthSession(req, res)
  if (!session) return

  try {
    let clubs = await prisma.club.findMany()
    let occurrences = {}

    clubs.map(club => {
      let slug = club.slug
      let toOccur = slug
      if (
        slug.split('-').length != 1 &&
        parseInt(slug.split('-')[slug.split('-').length - 1])
      ) {
        toOccur = slug.split('-')[slug.split('-').length - 1]
      }
      occurrences[toOccur] = occurrences[toOccur] ? occurrences[toOccur] + 1 : 0
    })

    slugger.occurrences = occurrences

    let club = await prisma.club.create({
      data: {
        slug: slugger.slug(req.body.name),
        name: req.body.name,
        website: req.body.website
          ? new URL(req.body.website).href.replace("http://", "https://")
          : null,
        logo: req.query.website
          ? `https://unavatar.io/${normalizeUrl(req.body.website, {
              stripProtocol: true
            })}`
          : 'https://assets.hackclub.com/icon-square.png',
        members: {
          create: { accountId: session.user.id, admin: true }
        }
      }
    })

    return res.json({ ...club, callback: `/clubs/${club.slug}` })
  } catch (e) {
    // console.error(e)
    return res.status(500).json({ error: true })
  }
}
