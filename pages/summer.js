import Head from 'next/head'
import Meta from '@hackclub/meta'
import Reaction from '../components/reaction'
import Feed from '../components/summer-feed'
import Footer from '../components/footer'

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
      <p style={{ maxWidth: '900px', margin: 'auto' }}>
        This page contains everything that Hack Clubbers
        got up to over the <a href="https://summer.hackclub.com/">Summer of Making</a>.
        Scrapbook was originally built for the summer and whilst it is now a permanent feature of the community 
        we've kept this page up as an archive. 
      </p>
    </header>
    <style jsx>{`
      header {
        text-align: center;
        padding: 0 12px 48px;
        margin-bottom: 30px;
        background: #f46b45;  /* fallback for old browsers */
        background: -webkit-linear-gradient(to right, #eea849, #f46b45);  /* Chrome 10-25, Safari 5.1-6 */
        background: linear-gradient(to right, #eea849, #f46b45); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
      }
      h1 {
        color: var(--colors-white);
        font-family: var(--fonts-display);
        margin: 0;
        font-size: 36px;
        line-height: 1;
        padding: 16px;
      }
      p {
        font-size: 18px;
        color: #fff;
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
        font-weight: 600;
        color: white;
        text-decoration: none;
      }
      a:hover,
      a:focus {
        text-decoration: underline;
        text-decoration-style: wavy;
        text-underline-position: under;
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
      .nav-link-home{
        display: none;
      }
    `}</style>
  </>
)

export default ({ reactions, initialData }) => (
  <>
  <Feed initialData={initialData} footer={<Footer />}>
    <Header reactions={reactions} />
  </Feed>
  <style>{`
    .nav {
      color: #fff;
      background: #f46b45;  /* fallback for old browsers */
      background: -webkit-linear-gradient(to right, #eea849, #f46b45);  /* Chrome 10-25, Safari 5.1-6 */
      background: linear-gradient(to right, #eea849, #f46b45); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
    }
    .nav-link{
      color: #fff;
    }
    .nav-link-home{
      
    } 
  
  `}</style>
  </>
)

export const getStaticProps = async () => {
  const { getPosts } = require('./api/summer-posts')
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
