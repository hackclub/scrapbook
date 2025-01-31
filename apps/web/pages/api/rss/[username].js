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

  posts.forEach(({ text, attachments, mux }) => {
    feed.item({
      title: `${username}'s scrapbook update`,
      description: text,
      enclosure: attachments[0]
        ? {
            url: attachments[0]
          }
        : {
            url: `https://image.mux.com/${mux[0]}/thumbnail.jpg?width=512&fit_mode=pad&time=0`,
            type: 'image/jpg'
          }
    })
  })

  res.setHeader('Content-type', 'application/rss+xml')
  res.send(feed.xml())
}
