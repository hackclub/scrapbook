import { useRouter } from 'next/router'
import useSWR from 'swr'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import CalendarHeatmap from '@hackclub/react-calendar-heatmap'
import Icon from '@hackclub/icons'
import Banner from '../../components/banner'
import Message from '../../components/message'
import { StaticMention } from '../../components/mention'
import Post from '../../components/post'
import AudioPlayer from '../../components/audio-player'
import ExamplePosts from '../../components/example-posts'
import FourOhFour from '../404'
import { clamp } from 'lodash'

const HOST =
  process.env.NODE_ENV === 'development' ? '' : 'https://scrapbook.hackclub.com'

const Tooltip = dynamic(() => import('react-tooltip'), { ssr: false })

// Calculate heatmap date range
const today = new Date()
const dateString = dt => dt.toISOString().substring(0, 10)
const heatmapEnd = dateString(today)
const heatmapStart = dateString(new Date(today.setDate(today.getDate() - 62)))

const Profile = ({
  profile = {},
  heatmap = [],
  webring = [],
  posts = [],
  children
}) => (
  <main className="container">
    <Meta
      as={Head}
      name="Hack Club Scrapbook"
      title={`@${profile.username}`}
      description={`Follow @${profile.username}’s progress ${
        profile.displayStreak && 0 < profile.streakCount
          ? `(currently a ${profile.streakCount}-day streak!) `
          : ''
      }making things in the Hack Club community.`}
      image={`https://workshop-cards.hackclub.com/@${
        profile.username
      }.png?brand=Scrapbook${
        profile.avatar ? `&images=${profile.avatar}` : ''
      }&caption=${
        profile.displayStreak && 0 < profile.streakCount
          ? profile.streakCount + '-day streak'
          : ''
      }`}
    />
    {profile.cssURL && (
      <link
        rel="stylesheet"
        type="text/css"
        href={HOST + `/api/css?url=${profile.cssURL}`}
      />
    )}
    {children}
    <header className="header">
      <div className="header-col-1">
        {profile.avatar && (
          <Image
            src={profile.avatar}
            key={profile.avatar}
            width={96}
            height={96}
            alt={profile.username}
            className="header-title-avatar"
          />
        )}
        <section>
          <h1 className="header-title-name">{profile.username}</h1>
          <div className="header-content">
            <span
              className={`badge header-streak header-streak-${
                profile.displayStreak && 0 < profile.streakCount
                  ? profile.streakCount === 1
                    ? 'singular'
                    : 'plural'
                  : 'zero'
              }`}
            >
              <Icon size={32} glyph="admin-badge" title="Streak icon" />
              <span className="header-streak-count">{`${profile.streakCount}-day streak`}</span>
            </span>
            <div className="header-links">
              {profile.slackID && (
                <Link
                  href="/[username]/mentions"
                  as={`/${profile.username}/mentions`}
                >
                  <a className="header-link header-link-mentions">
                    <Icon size={32} glyph="mention" />
                  </a>
                </Link>
              )}
              {profile.slackID && (
                <a
                  href={`https://app.slack.com/client/T0266FRGM/C01504DCLVD/user_profile/${profile.slackID}`}
                  target="_blank"
                  className="header-link header-link-slack"
                >
                  <Icon size={32} glyph="slack-fill" />
                </a>
              )}
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
            </div>
            {profile.customAudioURL && (
              <AudioPlayer url={profile.customAudioURL} />
            )}
          </div>
        </section>
      </div>
      {webring.length > 0 && (
        <aside className="header-col-2 header-webring">
          <h2>Webring</h2>
          <div className="header-webring-mentions">
            {webring.map(u => (
              <StaticMention
                user={u}
                className="header-webring-mention"
                title={u.mutual ? 'in each others’ webrings' : null}
                size={96}
                key={u.id}
              >
                {u.mutual && <Icon glyph="everything" size={24} />}
              </StaticMention>
            ))}
          </div>
        </aside>
      )}
      <aside className="header-col-3 header-chart" aria-hidden>
        <CalendarHeatmap
          startDate={heatmapStart}
          endDate={heatmapEnd}
          values={heatmap}
          showWeekdayLabels
          classForValue={v =>
            v?.count ? `color-${clamp(v.count, 1, 4)}` : 'color-empty'
          }
          tooltipDataAttrs={v => ({
            'data-tip': v?.date ? `${v?.date} updates: ${v?.count}` : ''
          })}
        />
        <Tooltip />
      </aside>
    </header>
    <article className="posts">
      {posts.map(post => (
        <Post key={post.id} user={profile} profile {...post} />
      ))}
      {posts.length === 1 && <ExamplePosts />}
    </article>
    {profile.cssURL && (
      <footer className="css" title="External CSS URL">
        <Icon
          glyph="embed"
          size={32}
          className="css-icon"
          aria-label="Code link icon"
        />
        <a
          href={
            profile.cssURL.includes('gist.githubusercontent')
              ? profile.cssURL
                  .replace('githubusercontent.', 'github.')
                  .split('/raw')?.[0]
              : profile.cssURL
          }
          target="_blank"
          className="css-link"
        >
          CSS:{' '}
          {profile.cssURL.includes('gist.githubusercontent')
            ? `Gist by @${profile.cssURL.split('.com/')?.[1]?.split('/')?.[0]}`
            : profile.cssURL}
        </a>
      </footer>
    )}
  </main>
)

const fetcher = url => fetch(url).then(r => r.json())

const Page = ({ username = '', router = {}, initialData = {} }) => {
  const { data, error } = useSWR(`/api/users/${username}/`, fetcher, {
    fallbackData: initialData,
    refreshInterval: 5000
  })
  if (!data) {
    return <Message text="Loading…" />
  } else if (error && !data) {
    return <Message text="Error" color1="orange" color2="pink" />
  } else {
    return (
      <Profile
        {...data}
        heatmap={initialData.heatmap}
        webring={initialData.webring}
      >
        <Banner isVisible={router.query.welcome === 'true'}>
          Woah!!! We’re communicating via a website now…welcome to your
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

const UserPage = props => {
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

export default UserPage

export const getStaticPaths = async () => {
  const { map } = require('lodash')
  const { getUsernames } = require('../api/usernames')
  let usernames = await getUsernames({
    where: { fullSlackMember: true },
    orderBy: { streakCount: 'desc' },
    take: 75
  })
  const paths = usernames.map(username => ({ params: { username } }))
  return { paths, fallback: true }
}

export const getStaticProps = async ({ params }) => {
  const { getProfile, getPosts } = require('../api/users/[username]/index')
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
    let webring = []
    if (profile.webring) {
      webring = await Promise.all(
        profile.webring.map(async id => {
          const u = await getProfile(id, 'slackID')
          try {
            u.mutual = u.webring.includes(profile.slackID)
          } catch {
            u.mutual = false
          }

          return u
        })
      )
    }
    return {
      props: { profile, webring, heatmap, posts },
      revalidate: 1
    }
  } catch (error) {
    console.error(error)
    return { props: { profile }, revalidate: 1 }
  }
}
