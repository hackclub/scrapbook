import { requireServerAuthSession } from '../../../../lib/auth-session'
import prisma from '../../../../lib/prisma'
import GithubSlugger from 'github-slugger'
import { profileInput } from '../../../../lib/profile-input'

const slugger = new GithubSlugger()

export default async (req, res) => {
  const session = await requireServerAuthSession(req, res)
  if (!session) return
  try {
    req.body = profileInput(req.body)
    if (typeof req.body.name !== 'string' || !req.body.name.trim())
      throw new Error('Missing name')
  } catch {
    return res
      .status(400)
      .json({ error: true, message: 'Invalid club details' })
  }

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
          ? new URL(req.body.website).href.replace('http://', 'https://')
          : null,
        logo: req.body.website
          ? `https://unavatar.io/${new URL(req.body.website).hostname}`
          : 'https://assets.hackclub.com/icon-square.png',
        members: {
          create: { accountId: session.user.id, admin: true }
        }
      }
    })

    return res.json({ ...club, callback: `/clubs/${club.slug}` })
  } catch {
    // console.error(e)
    return res.status(500).json({ error: true })
  }
}
