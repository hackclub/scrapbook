import Head from 'next/head'
import Meta from '@hackclub/meta'
import Posts from '../components/posts'

export default ({ posts }) => (
  <main className="container">
    <Meta
      as={Head}
      name="Summer Scrapbook"
      title="Summer Scrapbook"
      description="See everything the Hack Club community is making this summer."
      image="https://workshop-cards.hackclub.com/Summer%20Scrapbook.png?brand=Scrapbook&fontSize=300px"
    />
    <link rel="stylesheet" type="text/css" href="/themes/default.css" />
    <h1>Hack&nbsp;Club Summer Scrapbook</h1>
    <Posts posts={posts} />
    <style jsx>{`
      h1 {
        color: var(--colors-blue);
        text-align: center;
        margin-top: 0;
        margin-bottom: 2rem;
        font-size: 3rem;
        line-height: 1;
      }
      @supports (-webkit-background-clip: text) {
        h1 {
          background-image: radial-gradient(
            ellipse farthest-corner at top left,
            var(--colors-cyan),
            var(--colors-blue)
          );
          background-repeat: no-repeat;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    `}</style>
  </main>
)

export const getStaticProps = async () => {
  const { getPosts } = require('./api/posts')
  const posts = await getPosts()
  return { props: { posts }, unstable_revalidate: 2 }
}
