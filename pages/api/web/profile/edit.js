import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import prisma from '../../../../lib/prisma'

const TEAM_ID = 'team_gUyibHqOWrQfv3PDfEUpB45J'

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)
  if (session?.user === undefined) {
    return res.json({ error: true })
  }
  let account = await prisma.accounts.findFirst({
    where: {
      id: session.user.id
    }
  })
  if (req.body.customDomain || account.customDomain != null) {
    if (account.customDomain != null) {
      const prevDomain = account.customDomain
      const response = await fetch(
        `https://api.vercel.com/v1/projects/QmbACrEv2xvaVA3J5GWKzfQ5tYSiHTVX2DqTYfcAxRzvHj/alias?domain=${prevDomain}&teamId=${TEAM_ID}`,
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
      if (allUsers.length != 0 && allUsers[0].id != session.user.id) {
        return res.json({
          error: true,
          message: `Couldn't set your domain - owned by another user.`
        })
      }
      if (allClubs.length != 0) {
        return res.json({
          error: true,
          message: `Couldn't set your domain - owned by a club.`
        })
      }
      const vercelFetch = await fetch(
        `https://api.vercel.com/v9/projects/QmbACrEv2xvaVA3J5GWKzfQ5tYSiHTVX2DqTYfcAxRzvHj/domains?teamId=${TEAM_ID}`,
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
          console.log(`Error while setting custom domain ${arg}: ${err}`)
        })
      if (vercelFetch.error) {
        return res.json({
          error: true,
          message: `Couldn't set your domain - here's the error: ${JSON.stringify(
            vercelFetch.error
          )}`
        })
      } else if (!vercelFetch.verified) {
        return res.json({
          error: true,
          message: `Couldn't set your domain - domains using Vercel DNS aren't supported.`
        })
      }
    }
  }
  try {
    account = await prisma.accounts.update({
      where: {
        id: session.user.id
      },
      data: {
        username: req.body.username,
        email: req.body.email,
        website: req.body.website,
        pronouns: req.body.pronouns,
        cssURL: req.body.cssURL
          ? req.body.cssURL?.includes('http://') ||
            req.body.cssURL?.includes('https://') ||
            req.body.cssURL == ''
            ? req.body.cssURL
            : 'http://'.concat(req.body.cssURL)
          : null,
        website: req.body.website
          ? req.body.website?.includes('http://') ||
            req.body.website?.includes('https://') ||
            req.body.website == ''
            ? req.body.website
            : 'http://'.concat(req.body.website)
          : null,
        github: req.body.github
          ? req.body.github?.includes('https://') ||
            req.body.github?.includes('http://') ||
            req.body.github == ''
            ? req.body.github
            : 'https://'.concat(req.body.github)
          : null,
        customDomain: req.body.customDomain ? req.body.customDomain : null
      }
    })
    return res.json(account)
  } catch (e) {
    console.error(e)
    return res.json({ error: true })
  }
}
