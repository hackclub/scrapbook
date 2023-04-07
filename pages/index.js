import { useRouter } from 'next/router'
import { getStaticProps as getUserProps } from './[username]/'
import { getStaticProps as getClubProps } from './clubs/[slug]'
import getUsers from './api/users'
import getClubs from './api/clubs'
import UserPage from './[username]/'
import ClubPage from './clubs/[slug]'
import Head from 'next/head'
import Link from 'next/link'
import Meta from '@hackclub/meta'
import Reaction from '../components/reaction'
import Feed from '../components/feed'
import Footer from '../components/footer'

const Header = ({ reactions, children }) => (
  <>
    <Meta
      as={Head}
      name="Hack Club Scrapbook"
      title="Home"
      description="A daily streak system & portfolio for your projects. Join the Hack Club community of high school hackers & get yours started."
      image="https://cloud-53i932gta-hack-club-bot.vercel.app/0scrapbook.jpg"
    />
    <header>
      {children}
      <h3>beta v2.0</h3>
      <h1>Hack Club’s Scrapbook</h1>
      <p>
        A daily diary of what <a href="https://hackclub.com/">Hack Clubbers</a>{' '}
        are learning & making{' '}
        <Link href="/streaks" passHref>
          <a>every day</a>
        </Link>
        .
      </p>
      <article className="post-reactions">
        <h2 className="headline">Explore</h2>
        {reactions.map(reaction => (
          <Reaction key={reaction.name} {...reaction} />
        ))}
      </article>
    </header>
    <style jsx>{`
      header {
        text-align: center;
        padding: 0 12px 48px;
      }
      h1 {
        color: var(--colors-orange);
        font-family: var(--fonts-display);
        margin: 0;
        font-size: 36px;
        line-height: 1;
        padding: 16px;
        padding-top: 0px;
      }
      h3 {
        color: var(--colors-text);
        font-family: var(--fonts-display);
        margin: auto;
        font-size: 16px;
        line-height: 1;
        text-align: right;
        max-width: 680px;
        margin-bottom: -12px;
        opacity: 0.6;
      }
      p {
        font-size: 18px;
        color: var(--colors-text);
      }
      @media (min-width: 32em) {
        h1 {
          font-size: 48px;
        }
        p {
          font-size: 24px;
        }
        header {
          padding: 24px 0 48px;
        }
      }
      @media (min-width: 48em) {
        h1 {
          font-size: 64px;
        }
      }
      a {
        color: var(--colors-orange);
        text-decoration: none;
      }
      a:hover,
      a:focus {
        text-decoration: underline;
        text-decoration-style: wavy;
        text-underline-position: under;
      }
      @supports (-webkit-background-clip: text) {
        h1 {
          background-image: radial-gradient(
            ellipse farthest-corner at top left,
            var(--colors-yellow),
            var(--colors-orange)
          );
          background-repeat: no-repeat;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
      .post-reactions {
        justify-content: center;
        align-items: center;
        margin-top: 12px;
      }
      h2 {
        margin: 0 16px 12px;
        font-size: 18px;
      }
    `}</style>
  </>
)

const IndexPage = ({ reactions, initialData, type, ...props }) => {
  const router = useRouter()
  if(type == "user") return <UserPage {...props} />
  if(type == "club") return <ClubPage {...props} />
  return (
    <Feed initialData={initialData} footer={<Footer />}>
      {!router?.query?.embed && <Header reactions={reactions} />}
    </Feed>
  )
}

export default IndexPage

export const getServerSideProps = async (context) => {
  const { getPosts } = require('./api/posts')
  const initialData = await getPosts(48)
  const { find, compact, map, flatten } = require('lodash')
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
  const reactions = compact(
    names.map(name => find(flatten(map(initialData, 'reactions')), { name }))
  )
  const host = context.req.headers.host;
  if(!host.includes("hackclub.dev") && host != "scrapbook.hackclub.com"){
    const users = await getUsers().then(r => r.filter(function(user){
        return user.customDomain == host;
    }))
    if (user.length == 0) {
      const clubs = await getClubs().then(r => r.filter(function(club){
          return club.customDomain == host;
      }))
      if (clubs.length != 0) {
        let { props } = await getClubProps({ params: {slug: clubs[0].slug}})
        return { props: { ...props, type: "club" } }
      }
    }
    else {
      let { props } = await getUserProps({ params: {slug: users[0].username}})
      return { props: { ...props, type: "user" } }
    }
  }
  return { props: { reactions, initialData, type: "index" } }
}
