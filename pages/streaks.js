import Head from 'next/head'
import Meta from '@hackclub/meta'
import Mention from '../components/mention'
import { orderBy } from 'lodash'

const StreaksPage = ({ users }) => {
  return (
    <>
      <Meta
        as={Head}
        name="Hack Club's Scrapbook"
        title="About"
        description="A daily streak system & portfolio for your projects. Join the Hack Club community & get yours started."
        image="https://cloud-53i932gta-hack-club-bot.vercel.app/0scrapbook.jpg"
      />
      <style jsx global>{`
        .container {
          max-width: 500px !important;
          font-size: 20px !important;
          line-height: 1.625;
        }

        h1 {
          font-size: 3rem;
          line-height: 1.25;
          text-align: center;
          margin-top: 0;
          margin-bottom: 0.5em;
          font-style: italic;
        }

        .item {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5em;
        }
      `}</style>

      <h1>Who's got the highest streak?</h1>
      <main className="container">
        {orderBy(users, 'maxStreaks', 'desc')
          .slice(0, 40)
          .map(u => (
            <div key={u.id} className="item">
              <Mention username={u.username} />
              <p>{u.maxStreaks} 🔥</p>
            </div>
          ))}
      </main>
    </>
  )
}

export default StreaksPage

export const getStaticProps = async () => {
  const streaks = require('./api/streaks')
  const users = await streaks.getUserStreaks()
  return {
    props: {
      users
    },
    revalidate: 10
  }
}
