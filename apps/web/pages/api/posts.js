import { getPosts } from '../../lib/posts'

export {
  exclude,
  formatTS,
  getPosts,
  getRawPosts,
  transformPost,
  transformReactions
} from '../../lib/posts'

export default async (req, res) => {
  try {
    let where = {}
    if (req.query.gt) {
      where = {
        postTime: {
          gt: new Date(req.query.gt * 1000) // multiply by 1000 to get timestamp
        }
      }
    }

    const posts = await getPosts(
      where,
      req.query.max ? Number(req.query.max) : 200
    )
    res.json(posts)
  } catch {
    res.status(404).json([])
  }
}
