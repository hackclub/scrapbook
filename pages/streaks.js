import Head from 'next/head'
import Meta from '@hackclub/meta'
import Mention from '../components/mention'
import { orderBy } from 'lodash'

const StreaksPage = ({ users }) => {
  return (
    <>
      <Meta
        as={Head}
        name="Hack Club Scrapbook"
        title="Streaks"
        description="A daily streak system & portfolio for your projects. Join the Hack Club community & get yours started."
        image="https://cloud-53i932gta-hack-club-bot.vercel.app/0scrapbook.jpg"
      />
      <style jsx global>{`
        .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          place-content: center;
          place-items: center;
          place-self: center;
          max-width: 1000px !important;
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
          width: 350px;
        }

        @media (max-width: 800px) {
          .container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <h1>Who's got the highest streak?</h1>
      <main className="container">
        <div>
          <h2>Current</h2>
          {orderBy(users, 'streakCount', 'desc')
            .filter(u => u.slackID !== 'U035D3VA7R7')
            .slice(0, 15)
            .map(u => (
              <div key={u.id} className="item">
                <Mention username={u.username} />
                <p>{u.streakCount}&nbsp;🔥</p>
              </div>
            ))}
        </div>
        <div>
          <h2>All time</h2>
          {orderBy(users, 'maxStreaks', 'desc')
            .slice(0, 15)
            .map(u => (
              <div key={u.id} className="item">
                <Mention username={u.username} />
                <p>{u.maxStreaks}&nbsp;🔥</p>
              </div>
            ))}
        </div>
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
