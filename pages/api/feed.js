import { getStaticProps as getUserProps } from '../[username]/'
import { getStaticProps as getClubProps } from '../clubs/[slug]'
import { getRawUsers } from './users'
import { getRawClubs } from './clubs'
import { find, compact, map, flatten } from 'lodash-es';
import { getPosts } from './posts';

export default async function buildFeedData(req, res) {
  const names = [
    'art',
    'package',
    'hardware',
    'vsc',
    'nextjs',
    'js',
    'vercel',
    'swift',
    'rustlang',
    'slack',
    'github',
    'car',
    'musical_note',
    'robot_face',
    'birthday',
    'winter-hardware-wonderland'
  ]

  const host = req.headers.host;
  if (!host.includes("hackclub.dev") && host != "scrapbook.hackclub.com") {
    let [users, clubs] = await Promise.all([getRawUsers(), getRawClubs()])
    // console.log([users, clubs])
    users = users.filter((user) => user.customDomain == host)
    clubs = clubs.filter((club) => club.customDomain == host)
    if (clubs.length != 0) {
      let { props } = await getClubProps({ params: {slug: clubs[0].slug}})
      return res.json({ ...props, type: 'club' });
    }
    if (users.length != 0) {
      let { props } = await getUserProps({ params: {username: users[0].username}})
      return res.json({ ...props, type: 'user' })
    }
  }

  const initialData = await getPosts(48)
  const reactions = compact(
    names.map(name => find(flatten(map(initialData, 'reactions')), { name }))
  )

  return res.json({ reactions, initialData, type: 'index'});
}