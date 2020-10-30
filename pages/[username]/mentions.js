import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Meta from '@hackclub/meta'
import Icon from '@hackclub/icons'
import Message from '../../components/message'
import Posts from '../../components/posts'
import FourOhFour from '../404'
import { proxy } from '../../lib/images'

const HOST =
  process.env.NODE_ENV === 'development' ? '' : 'https://scrapbook.hackclub.com'

const Profile = ({ profile = {}, posts = [] }) => (
  <>
    <Meta
      as={Head}
      name="Summer Scrapbook"
      title={`@${profile.username}'s mentions`}
      description={`@${profile.username}’s mentions on Hack Club's Summer Scrapbook`}
      image={`https://workshop-cards.hackclub.com/@${
        profile.username
      }'s.png?brand=Scrapbook${
        profile.avatar ? `&images=${profile.avatar}` : ''
      }&caption=${`mentions on the Scrapbook.`}`}
    />
    {profile.css && (
      <link
        rel="stylesheet"
        type="text/css"
        href={HOST + `/api/css?url=${profile.css}`}
      />
    )}
    <header>
      {profile.avatar && (
        <Image
          src={profile.avatar}
          width={96}
          height={96}
          alt={profile.username}
          className="header-title-avatar"
        />
      )}
      <div>
        <Link href="/[username]" as={`/${profile.username}`}>
          <a className="header-back">
            <Icon glyph="view-back" size={24} />@{profile.username}
          </a>
        </Link>
        <h1>Mentions</h1>
      </div>
    </header>
    {posts.length === 0 && (
      <h2 className="headline blankslate">No mentions yet :(</h2>
    )}
    <Posts posts={posts} />
    <style jsx>{`
      header {
        margin: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 24px 16px 48px;
      }
      .header-title-avatar {
        margin-left: 0;
        margin-right: 16px;
      }
      h1 {
        margin: 0;
        line-height: 1;
        font-size: 48px;
      }
      p {
        font-size: 14px;
        color: var(--colors-muted);
      }
      .header-back {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 4px 8px;
        margin-left: -12px;
        color: var(--colors-muted);
        font-weight: bold;
        border-radius: 999px;
        text-decoration: none;
        transition: box-shadow 0.125s ease-in-out;
      }
      .header-back:focus,
      .header-back:hover {
        box-shadow: 0 0 0 2px;
        outline: none;
      }
      .header-back svg {
        margin-right: 8px;
      }
      @media (min-width: 48em) {
        .header-title-avatar {
          margin-right: 32px;
        }
        h1 {
          font-size: 64px;
        }
      }
      .blankslate {
        text-align: center;
      }
    `}</style>
  </>
)

const Page = ({ username = '', router = {}, initialData = {} }) => {
  return <Profile {...initialData}></Profile>
}

const Mentions = props => {
  const router = useRouter()

  if (router.isFallback) {
    return <Message text="Loading…" color1="cyan" color2="blue" />
  } else if (props.profile?.username) {
    return (
      <Page
        username={props.profile.username}
        router={router}
        initialData={props}
      />
    )
  } else {
    return <FourOhFour />
  }
}

export default Mentions

export const getStaticPaths = async () => {
  return { paths: [], fallback: true }
}

export const getStaticProps = async ({ params }) => {
  const { getProfile, getMentions } = require('../api/users/[username]/index')
  if (params.username?.length < 2)
    return console.error('No username') || { props: {} }

  const profile = await getProfile(params.username)
  if (!profile || !profile?.username)
    return console.error('No profile') || { props: {} }

  try {
    const posts = await getMentions(profile)
    return {
      props: { profile, posts },
      revalidate: 1
    }
  } catch (error) {
    console.error(error)
    return { props: { profile }, revalidate: 1 }
  }
}
