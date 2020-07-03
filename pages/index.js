import Head from 'next/head'
import Meta from '@hackclub/meta'
import useSWR from 'swr'
import Banner from '../components/banner'
import Footer from '../components/footer'
import Message from '../components/message'
import Posts from '../components/posts'
import { useRouter } from 'next/router'
import { orderBy } from 'lodash'

const Header = ({ children }) => (
  <>
    <Meta
      as={Head}
      name="Summer of Making"
      title="Summer Scrapbook"
      description="A daily streak system & portfolio for your summer projects. Join the Hack Club community for the Summer of Making & get yours started."
      image="https://assets.hackclub.com/log/2020-06-18_scrapbook.jpg"
    />
    <header>
      {children}
      <h1>Hack Club’s Summer Scrapbook</h1>
      <p>
        Daily updates from <a href="https://hackclub.com/">Hack Clubbers</a>{' '}
        learning & making something new every day.
      </p>
    </header>
    <style jsx global>{`
      @media (prefers-color-scheme: dark) {
        :root {
          --colors-text: var(--colors-snow);
        }
      }
    `}</style>
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
    `}</style>
  </>
)

const fetcher = url => fetch(url).then(r => r.json())

export default ({ initialData }) => {
  const router = useRouter()

  const { data, error } = useSWR('/api/posts', fetcher, {
    initialData,
    refreshInterval: 5000
  })

  if (error) {
    return (
      <main className="container">
        <Header />
        <Posts posts={orderBy([initialData, data], a => a.length)[0]} />
      </main>
    )
  }

  if (!data) {
    return <Message text="Loading…" />
  }

  return (
    <main>
      <Header>
        <Banner
          avatar="/octocat.svg"
          isVisible={router.query?.ref === 'github'}
          title="Hello, GitHubber!"
        >
          To start posting on the Scrapbook,{' '}
          <a href="https://hackclub.com/slack/">join our Slack community</a>.
        </Banner>
      </Header>
      <Posts posts={data} />
      <Footer />
    </main>
  )
}

export const getStaticProps = async () => {
  const { getPosts } = require('./api/posts')
  const initialData = await getPosts()
  return { props: { initialData }, unstable_revalidate: 1 }
}
