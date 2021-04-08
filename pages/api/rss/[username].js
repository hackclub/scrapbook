import RSS from 'rss'
import { getPosts } from '../users/[username]'

export default async (req, res) => {
  const { username } = req.query

  const feed = new RSS({
    title: `${username}'s Hack Club Scrapbook`,
    feed_url: `https://scrapbook.hackclub.com/${username}.rss`,
    site_url: 'https://scrapbook.hackclub.com'
  })

  const posts = await getPosts({ username })

  posts.forEach(({ text, postedAt }) => {
    feed.item({
      title: `${username}'s scrapbook update`,
      description: text
    })
  })

  res.setHeader('Content-type', 'application/rss+xml')
  res.send(feed.xml())
}
