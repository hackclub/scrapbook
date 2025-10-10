import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]'
import prisma from '../../../../../lib/prisma'
import GithubSlugger from 'github-slugger'

const slugger = new GithubSlugger()
const TEAM_ID = 'team_gUyibHqOWrQfv3PDfEUpB45J'

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)

  if (session?.user === undefined) {
    res.status(401).json({ error: true })
  }

  let id = req.body.id
  delete req.body.id

  let club = await prisma.club.findFirst({
    where: {
      id
    }
  });

  if (req.body.customDomain || club.customDomain != null) {
    if (club.customDomain != null) {
      const prevDomain = club.customDomain

      const response = await fetch(
        `https://api.vercel.com/v1/projects/QmWRnAGRMjviMn7f2EkW5QEieMv2TAGjUz8RS698KZm5q8/alias?domain=${prevDomain}&teamId=${TEAM_ID}`,
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
      allUsers = allUsers.filter(function(user) {
        return user.customDomain == req.body.customDomain
      })
      allClubs = allClubs.filter(function(club) {
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
        ...req.body,
        members: undefined,
        website:
          req.body?.website != '' && req.body?.website
            ? new URL(req.body.website).href.replace('http://', 'https://')
            : null
      }
    })

    res.json({ club })
  } catch (e) {
    // console.error(e)
    res.status(500).json({ error: true })
  }
}
