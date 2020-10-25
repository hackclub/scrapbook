import Head from 'next/head'
import Meta from '@hackclub/meta'
import { useRouter } from 'next/router'
import { EmojiImg } from '../../components/emoji'
import Feed from '../../components/feed'
import Message from '../../components/message'
import Reaction from '../../components/reaction'
import FourOhFour from '../404'
import { filter, find, map, flatten, uniqBy, startCase, orderBy } from 'lodash'

const HOST =
  process.env.NODE_ENV === 'development' ? '' : 'https://scrapbook.hackclub.com'

const Header = ({ name, url, char }) => (
  <>
    <Meta
      as={Head}
      name="Summer Scrapbook"
      title={`${startCase(name)} Posts`}
      description="A daily streak system & portfolio for your summer projects. Join the Hack Club community for the Summer of Making & get yours started."
      image={`https://workshop-cards.hackclub.com/r/${name}.png?brand=Scrapbook${
        url
          ? '&images=' + url
          : '&images=https://www.webfx.com/tools/emoji-cheat-sheet/graphics/emojis/' +
            name +
            '.png'
      }
      &caption=${'Posts%20tagged%20with%20:' + name + ':'}`}
    />
    <header>
      {url ? (
        <EmojiImg src={url} name={name} width={48} height={48} />
      ) : (
        <h1>{char}</h1>
      )}
      <p>
        Posts tagged with <code>:{name}:</code>
      </p>
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
        margin-bottom: -12px;
        font-size: 36px;
        line-height: 1;
        padding: 16px;
      }
      p {
        font-size: 14px;
        color: var(--colors-muted);
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
        <Reaction key={reaction.name} {...reaction} />
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

export default ({ status, emoji, related = [], posts = [], css }) => {
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
          href={HOST + `/api/css?url=${css}`}
        />
        <Header {...emoji} />
      </Feed>
    )
  } else {
    return <FourOhFour />
  }
}

export const getStaticPaths = async () => {
  const names = [
    'art',
    'package',
    'hardware',
    'swift',
    'rustlang',
    'slack',
    'github',
    'vsc',
    'car',
    'musical_note',
    'robot_face',
    'birthday'
  ]
  const paths = names.map(emoji => ({ params: { emoji } }))
  return { paths, fallback: true }
}

export const getStaticProps = async ({ params }) => {
  const { getPosts } = require('../api/r/[emoji]')
  const name = params.emoji.toLowerCase()
  let css = await fetch(
    'https://airbridge.hackclub.com/v0.1/Scrapbook/Emoji%20CSS?select=' +
      JSON.stringify({ filterByFormula: `{Emoji} = "${params.emoji}"` })
  ).then(r => r.json())

  css = css.length > 0 ? css[0].fields['CSS URL'] : ''

  console.log(css)

  const lost = { props: { status: 404 }, revalidate: 1 }
  if (name.length < 2) return console.error('No emoji') || lost

  try {
    const posts = await getPosts(name)
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
    return { props: { emoji, posts, related, css: css }, revalidate: 1 }
  } catch (error) {
    console.error(error)
    return { props: { emoji: { name }, css: css }, revalidate: 1 }
  }
}
