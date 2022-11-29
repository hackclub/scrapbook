import type { FindClubs } from 'types/graphql'

import { Link, routes } from '@redwoodjs/router'

const MAX_STRING_LENGTH = 150

const _truncate = (value: string | number) => {
  const output = value?.toString()
  if (output?.length > MAX_STRING_LENGTH) {
    return output.substring(0, MAX_STRING_LENGTH) + '...'
  }
  return output ?? ''
}

const ClubsList = ({ clubs }: FindClubs) => {
  // const { currentUser } = useAuth()

  return (
    <>
      <main
        className="masonary"
        style={{ height: `${1000 * Math.floor((clubs.length + 1) / 3) + 1}px` }}
      >
        <div
          key="newclub_noid"
          className="masonary-item height-100 flex flex-col rounded-md border border-sunken bg-background p-3"
        >
          <div className="flex flex-row">
            <div className="mr-4 flex h-24 w-24 items-center justify-center bg-gradient-to-tl from-green to-blue text-5xl font-black text-white">
              +
            </div>
            <div>
              <span className="font-xs font-semibold italic text-purple">
                @newclub
              </span>
              <h3 className="text-2xl font-bold">Your club name here</h3>
              <p>Scrapook&apos;s better with friends. Make a club now!</p>
            </div>
          </div>
          <Link
            to={routes.newClub()}
            className="text-right font-bold text-slate"
          >
            NEW CLUB, NOW!
          </Link>
        </div>
        {clubs.map((club) => (
          <div
            key={club.id}
            className="masonary-item height-100 flex flex-col rounded-md border border-sunken bg-background p-3"
          >
            <div className="flex flex-row">
              <img
                className="mr-4 h-24 w-24"
                src={club.logo}
                alt={`${club.name}'s logo`}
              />
              <div>
                <span className="font-xs font-semibold italic text-purple">
                  @{club.slug}
                </span>
                <h3 className="text-2xl font-bold">{club.name}</h3>
                <p>{club.description}</p>
              </div>
            </div>
            <Link
              to={routes.club({ slug: club.slug })}
              className="text-right font-bold text-slate"
            >
              SEE MORE
            </Link>
          </div>
        ))}
      </main>
    </>
  )
}

export default ClubsList
