import Head from 'next/head'
import Meta from '@hackclub/meta'
import Feed from '../components/feed'
import Footer from '../components/footer'

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

export default ({ initialData }) => (
  <Feed initialData={initialData} footer={<Footer />}>
    <Header />
  </Feed>
)

export const getStaticProps = async () => {
  const { getPosts } = require('./api/posts')
  const initialData = await getPosts(50)
  return { props: { initialData }, unstable_revalidate: 1 }
}
