import { useRouter } from 'next/router'
import useSWR from 'swr'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import CalendarHeatmap from 'react-calendar-heatmap'
import Icon from '@hackclub/icons'
import Banner from '../components/banner'
import Message from '../components/message'
import Post from '../components/post'
import ExamplePosts from '../components/example-posts'
import FourOhFour from './404'

const HOST =
  process.env.NODE_ENV === 'development' ? '' : 'https://scrapbook.hackclub.com'

const Profile = ({ profile = {}, heatmap = [], posts = [], children }) => (
  <main className="container">
    <Meta
      as={Head}
      name="Summer Scrapbook"
      title={`@${profile.username}`}
      description={`Follow @${profile.username}’s progress ${
        profile.streakDisplay
          ? `(currently a ${profile.streakCount}-day streak!)`
          : ''
      } making things in the Hack Club community this summer.`}
      image={`https://workshop-cards.hackclub.com/@${
        profile.username
      }.png?brand=Scrapbook${
        profile.avatar ? `&images=${profile.avatar}` : ''
      }&caption=${profile.streakCount}-day streak`}
    />
    {profile.css && (
      <link
        rel="stylesheet"
        type="text/css"
        href={HOST + `/api/css?url=${profile.css}`}
      />
    )}
    {children}
    <header className="header">
      <div className="header-col-1">
        {/* <Link href="/" passHref>
          <a className="header-back">
            <Icon glyph="view-back" size={24} />
            All scraps
          </a>
        </Link> */}
        {profile.avatar && (
          <img
            src={profile.avatar}
            width={96}
            alt={profile.username}
            className="header-title-avatar"
          />
        )}
        <div>
          <h1 className="header-title-name">{profile.username}</h1>
          <section className="header-content">
            <span
              className={`badge header-streak header-streak-${
                profile.streakCount !== 1
                  ? profile.streakCount === 0
                    ? 'zero'
                    : 'plural'
                  : 'singular'
              }`}
            >
              <Icon size={32} glyph="admin-badge" title="Streak icon" />
              <span className="header-streak-count">{profile.streakCount}</span>
              <span className="header-streak-desc">-day streak</span>
            </span>
            <a
              href={`https://app.slack.com/client/T0266FRGM/C01504DCLVD/user_profile/${profile.slack}`}
              target="_blank"
              className="header-link header-link-slack"
            >
              <Icon size={32} glyph="slack-fill" />
            </a>
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                className="header-link header-link-github"
              >
                <Icon size={32} glyph="github" />
              </a>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                className="header-link header-link-website"
              >
                <Icon size={32} glyph="link" />
              </a>
            )}
             <a href="https://workshops.hackclub.com/orpheus/">
                <img src="https://raw.githubusercontent.com/hackclub/dinosaurs/master/dinosaur_waving.png" width={30} />
             </a>
          </section>
        </div>
      </div>
      <aside className="header-col-2 header-chart" aria-hidden>
        <CalendarHeatmap
          startDate={new Date('2020-06-14')}
          endDate={new Date('2020-08-16')}
          values={heatmap}
          showWeekdayLabels
          classForValue={v => (v?.count ? `color-${v.count}` : 'color-empty')}
          titleForValue={v =>
            v?.date ? `${v?.date} updates: ${v?.count}` : ''
          }
          width={128}
        />
      </aside>
    </header>
    <article className="posts">
      {posts.map(post => (
        <Post key={post.id} user={profile} profile {...post} />
      ))}
      {posts.length === 1 && <ExamplePosts />}
    </article>
    {profile.css && (
      <footer className="css" title="External CSS URL">
        <Icon
          glyph="embed"
          size={32}
          className="css-icon"
          aria-label="Code link icon"
        />
        <a
          href={
            profile.css.includes('gist.githubusercontent')
              ? profile.css
                  .replace('githubusercontent.', 'github.')
                  .split('/raw')?.[0]
              : profile.css
          }
          target="_blank"
          className="css-link"
        >
          CSS:{' '}
          {profile.css.includes('gist.githubusercontent')
            ? `Gist by @${profile.css.split('.com/')?.[1]?.split('/')?.[0]}`
            : profile.css}
        </a>
      </footer>
    )}
  </main>
)

const fetcher = url => fetch(url).then(r => r.json())

const Page = ({ username = '', router = {}, initialData = {} }) => {
  const { data, error } = useSWR(`/api/users/${username}`, fetcher, {
    initialData,
    refreshInterval: 5000
  })
  if (!data) {
    return <Message text="Loading…" />
  } else if (error) {
    return <Message text="Error" color1="orange" color2="pink" />
  } else {
    return (
      <Profile {...data}>
        <Banner isVisible={router.query.welcome === 'true'}>
          Woah!!! We’re communicating via a website now!…welcome to your
          scrapbook page!
          <br />
          Did you know you can{' '}
          <a href="https://scrapbook.hackclub.com/msw" target="_blank">
            customize your scrapbook profile
          </a>
          ?
          <br />
          <a
            href="https://app.slack.com/client/T0266FRGM/C015M6U6JKU"
            target="_blank"
          >
            Join the #scrapbook-css channel
          </a>{' '}
          to see how.
        </Banner>
      </Profile>
    )
  }
}

export default props => {
  const router = useRouter()

  if (router.isFallback) {
    return <Message text="Loading…" />
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

export const getStaticPaths = async () => {
  // const { getUsernames } = require('./api/usernames')
  // const usernames = await getUsernames()
  // const paths = usernames.map(username => ({ params: { username } }))
  return { paths: [], fallback: true }
}

export const getStaticProps = async ({ params }) => {
  const { getProfile, getPosts } = require('./api/users/[username]')
  if (params.username?.length < 2)
    return console.error('No username') || { props: {} }

  const profile = await getProfile(params.username)
  if (!profile || !profile?.username)
    return console.error('No profile') || { props: {} }

  try {
    const posts = await getPosts(profile)
    const { groupBy } = require('lodash')
    const days = groupBy(posts, p => p.postedAt?.substring(0, 10))
    const heatmap = Object.keys(days).map(date => ({
      date,
      count: days[date].length || 0
    }))
    return { props: { profile, heatmap, posts }, unstable_revalidate: 1 }
  } catch (error) {
    console.error(error)
    return { props: {} }
  }
}
