import Head from 'next/head'
import Meta from '@hackclub/meta'
import { useRouter } from 'next/router'
import Feed from '../../components/feed'
import Message from '../../components/message'
import { startCase } from 'lodash'

const Header = ({ emoji }) => (
  <>
    <Meta
      as={Head}
      name="Summer Scrapbook"
      title={`${startCase(emoji)} Posts`}
      description="A daily streak system & portfolio for your summer projects. Join the Hack Club community for the Summer of Making & get yours started."
      image="https://assets.hackclub.com/log/2020-06-18_scrapbook.jpg"
    />
    <header>
      <h1>{emoji}</h1>
      <p>
        Posts tagged with <code>:{emoji}:</code>
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
        font-size: 36px;
        line-height: 1;
        padding: 16px;
      }
      p {
        font-size: 16px;
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
      <Feed initialData={posts} src={`/api/r/${emoji}`}>
        <Header emoji={emoji} />
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
  const { emoji } = params
  if (emoji.length < 2) return console.error('No emoji') || { props: {} }

  try {
    const posts = await getPosts(emoji)
    return { props: { emoji, posts }, unstable_revalidate: 1 }
  } catch (error) {
    console.error(error)
    return { props: {} }
  }
}
