import { requireServerAuthSession } from '../../../../../lib/auth-session'
import prisma from '../../../../../lib/prisma'
import { profileInput } from '../../../../../lib/profile-input'

const TEAM_ID = 'team_gUyibHqOWrQfv3PDfEUpB45J'

export default async (req, res) => {
  const session = await requireServerAuthSession(req, res)
  if (!session) return

  const id = req.query.id
  if (
    typeof id !== 'string' ||
    !session.user.ClubMember.some(
      member => member.clubId === id && member.admin
    )
  ) {
    return res.status(403).json({ error: true, message: 'Forbidden' })
  }
  try {
    req.body = profileInput(req.body)
  } catch {
    return res.status(400).json({
      error: true,
      message: 'Invalid club URL or field. CSS must use a raw GitHub HTTPS URL.'
    })
  }

  let club = await prisma.club.findFirst({
    where: {
      id
    }
  })
  if (!club) return res.status(404).json({ error: true })

  if (req.body.customDomain || club.customDomain != null) {
    if (club.customDomain != null) {
      const prevDomain = club.customDomain

      await fetch(
        `https://api.vercel.com/v1/projects/QmWRnAGRMjviMn7f2EkW5QEieMv2TAGjUz8RS698KZm5q8/alias?domain=${encodeURIComponent(prevDomain)}&teamId=${TEAM_ID}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${process.env.VC_SCRAPBOOK_TOKEN}`
          }
        }
      ).then(res => res.json())
    }

    if (req.body.customDomain) {
      let [allUsers, allClubs] = await prisma.$transaction([
        prisma.accounts.findMany(),
        prisma.club.findMany()
      ])
      allUsers = allUsers.filter(function (user) {
        return user.customDomain == req.body.customDomain
      })
      allClubs = allClubs.filter(function (club) {
        return club.customDomain == req.body.customDomain
      })
      if (allUsers.length != 0) {
        return res.status(403).json({
          error: true,
          message: `Couldn't set your domain - owned by another user.`
        })
      }
      if (allClubs.length != 0 && allClubs[0].id != id) {
        return res.status(403).json({
          error: true,
          message: `Couldn't set your domain - owned by a club.`
        })
      }
      const vercelFetch = await fetch(
        `https://api.vercel.com/v9/projects/QmWRnAGRMjviMn7f2EkW5QEieMv2TAGjUz8RS698KZm5q8/domains?teamId=${TEAM_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.VC_SCRAPBOOK_TOKEN}`
          },
          body: JSON.stringify({
            name: req.body.customDomain
          })
        }
      )
        .then(r => r.json())
        .catch(err => {
          // console.log(`Error while setting custom domain ${arg}: ${err}`)
        })
      if (vercelFetch.error) {
        return res.status(500).json({
          error: true,
          message: `Couldn't set your domain - here's the error: ${JSON.stringify(
            vercelFetch.error
          )}`
        })
      } else if (!vercelFetch.verified) {
        return res.status().json({
          error: true,
          message: `Couldn't set your domain - domains using Vercel DNS aren't supported.`
        })
      }
    }
  }

  try {
    club = await prisma.club.update({
      where: {
        id
      },
      data: {
        // Explicitly exclude IDs and nested membership/update writes.
        name: req.body.name,
        location: req.body.location,
        banner: req.body.banner,
        logo: req.body.logo,
        github: req.body.github,
        cssURL: req.body.cssURL,
        customDomain: req.body.customDomain || null,
        description: req.body.description,
        website:
          req.body?.website != '' && req.body?.website
            ? new URL(req.body.website).href.replace('http://', 'https://')
            : null
      }
    })

    res.json({ club })
  } catch {
    // console.error(e)
    res.status(500).json({ error: true })
  }
}
