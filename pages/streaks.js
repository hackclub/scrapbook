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
        color: var(--colors-orange);
        font-family: var(--fonts-display);
        margin: 0;
        font-size: 36px;
        line-height: 1;
        padding: 16px;
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
