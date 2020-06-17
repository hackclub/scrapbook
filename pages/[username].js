import { useRouter } from 'next/router'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import CalendarHeatmap from 'react-calendar-heatmap'
import Icon from '@hackclub/icons'
import Post from '../components/post'
import FourOhFour from './404'

const HOST =
  process.env.NODE_ENV === 'development' ? '' : 'https://scrapbook.hackclub.com'

const Profile = ({ profile = {}, heatmap = [], posts = [] }) => (
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
        }${
        profile.streakDisplay
          ? `&caption=${profile.streakCount}-day streak`
          : ''
        }`}
    />
    {profile.css && (
      <link
        rel="stylesheet"
        type="text/css"
        href={HOST + `/api/css?url=${profile.css}`}
      />
    )}
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
            {profile.streakDisplay && (
              <span
                className={`badge header-streak header-streak-${
                  profile.streakCount !== 1 ? 'plural' : 'singular'
                }`}
              >
                <Icon size={32} glyph="admin-badge" title="Streak icon" />
                {profile.streakCount}
                -day streak
              </span>
            )}
            <a
              href={`https://app.slack.com/client/T0266FRGM/user_profile/${
                profile.slack
              }`}
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
          </section>
        </div>
      </div>
      <aside className="header-col-2 header-chart" aria-hidden>
        <CalendarHeatmap
          startDate={new Date('2020-06-12')}
          endDate={new Date('2020-08-15')}
          values={heatmap}
          showWeekdayLabels
          classForValue={v => (v ? `color-${v.count}` : 'color-empty')}
          titleForValue={v => `${v?.date}: ${v?.count} updates`}
          width={128}
        />
      </aside>
    </header>
    <article className="posts">
      {posts.map(post => (
        <Post key={post.id} user={profile} profile {...post} />
      ))}
      {posts.length === 1 && (
        <>
          <Post
            text="The Cambrian explosion of life on Earth."
            postedAt="530M yrs ago"
            attachments={[
              {
                filename: 'cambrian.jpg',
                type: 'image/jpg',
                thumbnails: {
                  large: {
                    url:
                      'https://scx2.b-cdn.net/gfx/news/hires/2016/proteinlikes.png'
                  }
                }
              }
            ]}
            profile
            muted
          />
          <Post
            text="The Big Bang begins the universe."
            postedAt="13.8B yrs ago"
            attachments={[
              {
                filename: 'bigbang.jpg',
                type: 'image/jpg',
                thumbnails: {
                  large: {
                    url:
                      'https://cdn.mos.cms.futurecdn.net/vLq9PC5VDGqgCFXxSUUCaQ-1024-80.jpg'
                  }
                }
              }
            ]}
            profile
            muted
          />
        </>
      )}
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
              ? profile.css.replace('githubusercontent.', 'github.').split('/raw')?.[0]
              : profile.css
          }
          target="_blank"
          className="css-link"
        >
          CSS:{' '}
          {profile.css.includes('gist.githubusercontent')
            ? `Gist by @${profile.css.match(/\.com\/(\w+)(?=\/)/)?.[1]}`
            : profile.css}
        </a>
      </footer>
    )}
  </main>
)

const Loading = () => (
  <main className="container">
    <h1>Loading…</h1>
    <style jsx>{`
      main {
        text-align: center;
        padding: 32px 16px;
      }
      h1 {
        color: var(--colors-green);
        font-family: var(--fonts-display);
        margin: 0;
        font-size: 56px;
        line-height: 1;
      }
      @media (min-width: 32em) {
        h1 {
          font-size: 64px;
        }
      }
      @supports (-webkit-background-clip: text) {
        h1 {
          background-image: radial-gradient(
            ellipse farthest-corner at top left,
            var(--colors-yellow),
            var(--colors-green)
          );
          background-repeat: no-repeat;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    `}</style>
  </main>
)

export default props => {
  const router = useRouter()

  if (router.isFallback) {
    return <Loading />
  } else if (props.profile?.username) {
    return <Profile {...props} />
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
