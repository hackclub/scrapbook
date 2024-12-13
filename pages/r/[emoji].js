import Head from 'next/head'
import Meta from '@hackclub/meta'
import { useRouter } from 'next/router'
import { EmojiImg } from '../../components/emoji'
import { Epoch, EpochBA, EpochTX, EpochVT } from '../../components/epoch'
import { SummerOfMaking } from '../../components/summer-of-making'
import Feed from '../../components/feed'
import Message from '../../components/message'
import Reaction from '../../components/reaction'
import FourOhFour from '../404'
import { filter, find, map, flatten, uniqBy, startCase, orderBy } from 'lodash-es'

const HOST =
  process.env.NODE_ENV === 'development' ? '' : 'https://scrapbook.hackclub.com'

const formatName = name =>
  startCase(name)
    .replace(/js/i, 'JS')
    .replace(/vt/i, 'VT')
    .replace(/tx/i, 'TX')
    .replace(/ba/i, 'BA')

const Header = ({ name, url, char }) => (
  <>
    <Meta
      as={Head}
      name="Hack Club Scrapbook"
      title={`${formatName(name)} Posts`}
      description="A daily streak system & portfolio for your projects. Join the Hack Club community of high school hackers to get yours started."
      image={`https://workshop-cards.hackclub.com/r/${formatName(
        name
      )}.png?brand=Scrapbook${
        url
          ? '&images=' + url
          : '&images=https://www.webfx.com/tools/emoji-cheat-sheet/graphics/emojis/' +
            name +
            '.png'
      }
      &caption=${'Posts%20tagged%20with%20:' + name + ':'}`}
    />
    {!name.includes('epoch') && (
      <header>
        {url ? (
          <EmojiImg src={url} key={url} name={name} width={48} height={48} />
        ) : (
          <h1>{char}</h1>
        )}
        <p>
          Posts tagged with <code>:{name}:</code>
        </p>
      </header>
    )}
    {name === 'summer-of-making' && <SummerOfMaking />}
    {name === 'epoch' && <Epoch />}
    {name === 'epoch-ba' && <EpochBA />}
    {name === 'epoch-tx' && <EpochTX />}
    {name === 'epoch-vt' && <EpochVT />}
    <style jsx>{`
      header {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0 12px 48px;
      }
      h1 {
        color: var(--colors-orange);
        font-family: var(--fonts-display);
        margin: 0;
        margin-bottom: -12px;
        font-size: 36px;
        line-height: 1;
        padding: 16px;
      }
      p {
        margin-top: 8px;
        color: var(--colors-muted);
        text-align: center;
        max-width: 640px;
        margin-left: auto;
        margin-right: auto;
      }
      header + p {
        font-size: 20px;
        margin-bottom: 48px;
      }
      header + p > a {
        background: linear-gradient(to right, #eea849, #f46b45);
        color: #fff;
        padding: 0 6px;
        margin: 0 4px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
      }
      code {
        font-size: inherit;
        color: var(--colors-purple);
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
    `}</style>
  </>
)

const Footer = ({ reactions = [] }) => (
  <footer>
    <h2 className="headline">Related reactions</h2>
    <article className="post-reactions">
      {reactions.map(reaction => (
        <Reaction key={'footer' + reaction.name} {...reaction} />
      ))}
    </article>
    <style jsx>{`
      footer {
        text-align: center;
        padding: 24px 24px 48px;
        margin: auto;
      }
      .post-reactions {
        justify-content: center;
        margin-top: 12px;
      }
    `}</style>
  </footer>
)

const Page = ({ status, emoji, related = [], posts = [], css }) => {
  const router = useRouter()

  if (status === 404) {
    return <FourOhFour />
  }

  if (router.isFallback) {
    return <Message text="Loading…" />
  } else if (emoji) {
    return (
      <Feed
        initialData={posts}
        src={`/api/r/${emoji.name}`}
        footer={related.length > 1 && <Footer reactions={related} />}
      >
        <link
          rel="stylesheet"
          type="text/css"
          href={HOST + css.includes('http') ? `/api/css?url=${css}` : css}
        />
        <Header {...emoji} />
      </Feed>
    )
  } else {
    return <FourOhFour />
  }
}

export default Page

export const getStaticPaths = async () => {
  const names = [
    'summer-of-making',
    'art',
    'package',
    'hardware',
    'swift',
    'vercel',
    'js',
    'rustlang',
    'slack',
    'github',
    'vsc',
    'car',
    'musical_note',
    'robot_face',
    'birthday',
    'gamelab',
    'epoch',
    'epoch-ba',
    'epoch-vt',
    'epoch-tx'
  ]
  const paths = names.map(emoji => ({ params: { emoji } }))
  return { paths, fallback: true }
}

export const getStaticProps = async ({ params }) => {
  const { getPosts } = require('../api/r/[emoji]')
  const name = params.emoji.toLowerCase()
  let cssURLs = {
    gamelab: '/themes/gamelab.css',
    'zachday-2020':
      'https://gist.githubusercontent.com/cjdenio/efc9f7645025288725c2d2e5aa095ccf/raw/cc90f61afdcae44c8819ee7e2b0ac021c5d6abe8/zachday-2020.css'
  }

  let css = cssURLs[name] || ''

  const lost = { props: { status: 404 }, revalidate: 1 }
  if (name.length < 2) return console.error('No emoji') || lost

  try {
    const posts = await getPosts(
      name,
      48,
      name == 'summer-of-making'
        ? {
            postTime: {
              lte: new Date(2021, 1)
            }
          }
        : {}
    )
    if (!posts || posts.length === 0) return lost
    const allReactions = flatten(map(posts, 'reactions'))
    const emoji = find(allReactions, { name })
    const related = orderBy(
      uniqBy(
        filter(allReactions, r => r.name !== name),
        r => r.name
      ),
      'name'
    )
    return { props: { emoji, posts, related, css }, revalidate: 1 }
  } catch (error) {
    console.error(error)
    return { props: { emoji: { name }, css }, revalidate: 1 }
  }
}
