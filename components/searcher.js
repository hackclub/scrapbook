import SearchBar from './searchbar'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const Searcher = props => {
  const [searchState, setSearchState] = useState()
  const [profileData, setProfileData] = useState([])
  const [users, setUsers] = useState([])
  const router = useRouter()

  useEffect(() => {
    fetch('/api/users')
      .then(response => response.json())
      .then(data => setUsers(data))
  }, [])

  const updateProfiles = queryData => {
    if (!users || users.length <= 0) {
      return []
    }

    const filteredArr = users.filter(
      user => user.username.indexOf(queryData) !== -1
    )

    console.log(users)
    setProfileData(filteredArr)
    //setProfile(data)
  }
  return (
    <>
      <div className="searchbox-container">
        <form
          onSubmit={() => {
            router.push(`/search/?q=${searchState}`)
          }}
        >
          <SearchBar
            placeholder="Find Hack Clubbers!"
            centerText={true}
            onChange={event => {
              setSearchState(event.target.value)
              updateProfiles(event.target.value)
            }}
          />
        </form>
        <div className="search-result-container">
          {profileData.map((hackclubber, i) => {
            return (
              <li key={i} className="profile-card">
                <Image
                  src={hackclubber.avatar}
                  key={hackclubber.avatar}
                  width={42}
                  height={42}
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
          })}
        </div>
      </div>

      <style jsx>
        {`
          @media (prefers-color-scheme: dark) {
            .search-result-container {
              background-color: var(--colors-darkless);
            }

            .profile-card {
              background-color: var(--colors-darkless);
            }
          }

          @media (prefers-color-scheme: light) {
            .search-result-container {
              background-color: white;
              border: 1px solid lightgrey;
            }

            .profile-card {
              background-color: white;
            }
          }

          .searchbox-container {
            width: 100%;
            position: absolute;
          }

          .profile-card {
            display: flex;
            align-items: center;
            justify-content: center;

            width: 100%;
            border-radius: 15px;

            padding-top: 1rem;
            padding-bottom: 1rem;
            padding-left: 2rem;
            padding-right: 2rem;
            margin-bottom: 0.5rem;
          }

          .username {
            margin-left: 1rem;
          }

          .search-result-container {
            max-width: 500px;
            max-height: 500px;
            overflow: auto;
            border-radius: 15px;
            position: absolute;
            margin-left: auto;
            margin-right: auto;
            left: 0;
            right: 0;
            text-align: center;

            background-color: var(--colors-background);
            padding: 1rem;

            ${profileData && profileData.length > 0 && searchState !== ''
              ? ''
              : 'display: none;'}
          }
        `}
      </style>
    </>
  )
}

export default Searcher
