import { map, find, isEmpty, orderBy } from 'lodash-es'
import { getRawPosts, transformPost } from '../../posts'
import prisma from '../../../../lib/prisma'
import { getRawUsers } from '../../users'
import { emailToPfp } from '../../../../lib/email'

export const getClub = async (value, field = 'slug') => {
  let where = {}
  where[field] = value

  const opts = {
    where,
    include: {
      members: {
        include: {
          account: {
            select: {
              avatar: true,
              username: true,
              email: true,
              updates: true
            }
          }
        }
      }
    }
  }

  try {
    let club = await prisma.club.findFirst(opts)
    club.members = club.members.map(member => ({
      ...member,
      account: {
        ...member.account,
        avatar: member.account.avatar || emailToPfp(member.account.email),
        email: null,
        updates: member.account.updates.length
      }
    }))
    return club && club?.slug ? club : {};
  } catch {
    return {};
  }
}

export const getPosts = async (club, max = null) => {
  try {
    const allUpdates = await getRawPosts(max, {
      where: {
        ClubUpdate: {
          clubId: club.id
        }
      }
    })

    if (!allUpdates) console.error('Could not fetch posts')

    const users = await getRawUsers()

    const clubUpdates = allUpdates
      .map(p => {
        p.user = find(users, { id: p.accountsID }) || {}
        return p
      })
      .filter(p => !isEmpty(p.user))
      .map(p => transformPost(p));

    return clubUpdates;
  } catch {
    return [];
  }
}

export default async (req, res) => {
  const club = await getClub(req.query.slug)
  if (!club?.name)
    return res.status(404).json({ status: 404, error: 'Cannot locate club' })
  const posts =
    (await getPosts(club, req.query.max ? Number(req.query.max) : null)) || []
  res.json({ club, posts })
}
