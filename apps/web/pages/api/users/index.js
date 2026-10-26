import { getRawUsers, transformProfile } from '../../../lib/users'
import { postLimit } from '../../../lib/pagination'

// Find users with at least one Scrapbook post
export default async (req, res) => {
  try {
    const rawUsers = await getRawUsers(
      {
        NOT: {
          updates: {
            none: {}
          }
        }
      },
      undefined,
      postLimit(req.query?.max)
    )

    const users = rawUsers.map(transformProfile)
    res.json(users)
  } catch {
    res.status(404).json([])
  }
}
