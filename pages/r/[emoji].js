import Head from 'next/head'
import Meta from '@hackclub/meta'
import { useRouter } from 'next/router'
import { EmojiImg } from '../../components/emoji'
import Feed from '../../components/feed'
import Message from '../../components/message'
import { find, map, flatten, startCase } from 'lodash'

const Header = ({ name, url, char }) => (
  <>
    <Meta
      as={Head}
      name="Summer Scrapbook"
      title={`${startCase(name)} Posts`}
      description="A daily streak system & portfolio for your summer projects. Join the Hack Club community for the Summer of Making & get yours started."
      image={`https://workshop-cards.hackclub.com/r/${
        name
      }.png?brand=Scrapbook${
        url ? (
          '&images='+url
        ) : ('&images=https://www.webfx.com/tools/emoji-cheat-sheet/graphics/emojis/'+name+'.png'
        )}
      &caption=${
        'Posts tagged with :' + name + ':'
      }`}
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

export default ({ emoji, posts = [] }) => {
  const router = useRouter()

  if (router.isFallback) {
    return <Message text="Loading…" />
  } else if (emoji) {
    return (
      <Feed initialData={posts} src={`/api/r/${emoji.name}`}>
        <Header {...emoji} />
      </Feed>
    )
  } else {
    return <FourOhFour />
  }
}

export const getStaticPaths = async () => {
  return { paths: [], fallback: true }
}

export const getStaticProps = async ({ params }) => {
  const { getPosts } = require('../api/r/[emoji]')
  if (params.emoji.length < 2) return console.error('No emoji') || { props: {} }

  try {
    const posts = await getPosts(params.emoji)
    const emoji = find(flatten(map(posts, 'reactions')), { name: params.emoji })
    console.log(emoji)
    return { props: { emoji, posts }, unstable_revalidate: 1 }
  } catch (error) {
    console.error(error)
    return { props: { emoji: { name: params.emoji } }, unstable_revalidate: 1 }
  }
}
