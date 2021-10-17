import Head from 'next/head'
import Meta from '@hackclub/meta'
import Image from 'next/image'
import Link from 'next/link'
import TextBox from '../components/textbox'
import { useState } from 'react'
import { useRouter } from 'next/router'

const searchPage = props => {
  const [searchState, setSearchState] = useState('')
  const router = useRouter()

  return (
    <>
      <main>
        <Meta
          as={Head}
          name="Hack Club Scrapbook"
          title="Search"
          description="A daily streak system & portfolio for your projects. Join the Hack Club community of high school hackers & get yours started."
          image="https://cloud-53i932gta-hack-club-bot.vercel.app/0scrapbook.jpg"
        />

        <section className="search-bar-box">
          <form
            onSubmit={() => {
              router.push(`/search/?q=${searchState}`)
            }}
          >
            <TextBox
              placeholder="Find Hack Clubbers!"
              textSetter={setSearchState}
            />
          </form>
        </section>

        <section>
          <ul>
            {props.initialData.length > 0 ? (
              props.initialData.map((hackclubber, i) => {
                return (
                  <li key={i} className="profile-card">
                    <Image
                      src={hackclubber.avatar}
                      key={hackclubber.avatar}
                      width={72}
                      height={72}
                      alt={hackclubber.username}
                      className="header-title-avatar"
                    />
                    <Link href={`/${hackclubber.username}`}>
                      <a className="header-link">
                        <h2 className="username">{hackclubber.username}</h2>
                      </a>
                    </Link>
                  </li>
                )
              })
            ) : (
              <h2>Nobody found :(</h2>
            )}
          </ul>
        </section>
      </main>
      <style jsx>
        {`
          main {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          section {
            display: flex;
            justify-content: center;
          }

          .profile-card {
            display: flex;
            align-items: center;
            justify-content: center;
            max-width: 400px;

            background-color: white;
            border-radius: 15px;

            padding-top: 1rem;
            padding-bottom: 1rem;
            padding-left: 2rem;
            padding-right: 2rem;
          }

          .username {
            margin-left: 1rem;
          }

          .search-bar-box {
            margin-bottom: 1rem;
            margin-top: 1rem;
          }
        `}
      </style>
    </>
  )
}

export const getServerSideProps = async context => {
  const { query } = context

  const { searchUsers } = require('./api/users/search')
  const initialData = await searchUsers(query.q)

  return { props: { initialData } }
}

export default searchPage
