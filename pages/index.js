import Head from 'next/head'
import Meta from '@hackclub/meta'
import Reaction from '../components/reaction'
import Feed from '../components/feed'
import Footer from '../components/footer'
import { StyleMention } from '../components/mention'

const StyleCredit = () => (
  <a className="badge" style={{ marginTop: '15px' }}>
    <StyleMention username="sampoder" />
    <style jsx>{`
      a {
        background-color: var(--colors-blue);
        color: var(--colors-background);
        padding: 3px 12px 1px;
        margin-left: 16px;
        text-decoration: none;
        text-transform: uppercase;
        transition: 0.125s background-color ease-in-out;
      }
      a:hover,
      a:focus {
        background-color: var(--colors-purple);
      }
    `}</style>
  </a>
)

const Header = ({ reactions, children }) => (
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
        A daily diary of what <a href="https://hackclub.com/">Hack Clubbers</a>{' '}
        are learning & making every day.
      </p>
      <article className="post-reactions">
        <h2 className="headline">Explore</h2>
        {reactions.map(reaction => (
          <Reaction key={reaction.name} {...reaction} />
        ))}
      </article>
      <StyleCredit />
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
      .post-reactions {
        justify-content: center;
        align-items: center;
        margin-top: 12px;
      }
      h2 {
        margin: 0 16px 12px;
        font-size: 18px;
      }
    `}</style>
  </>
)

export default ({ reactions, initialData }) => (
  <Feed initialData={initialData} footer={<Footer />}>
    <Header reactions={reactions} />
  </Feed>
)

export const getStaticProps = async () => {
  const { getPosts } = require('./api/posts')
  const initialData = await getPosts(64)
  const { find, compact, map, flatten } = require('lodash')
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
  const reactions = compact(
    names.map(name => find(flatten(map(initialData, 'reactions')), { name }))
  )
  return { props: { reactions, initialData }, unstable_revalidate: 1 }
}
