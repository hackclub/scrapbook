import type { FindClubs } from 'types/graphql'

import { Link, routes } from '@redwoodjs/router'
import type { CellFailureProps, CellSuccessProps } from '@redwoodjs/web'

import Clubs from 'src/components/Club/Clubs'

export const QUERY = gql`
  query FindClubs {
    clubs {
      id
      slug
      name
      description
      logo
      customDomain
      cssURL
      website
      github
      members {
        accountId
        admin
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="height-100 flex flex-col rounded-md border border-sunken bg-background p-3">
      <div className="flex flex-row">
        <div className="mr-4 flex h-24 w-24 items-center justify-center bg-gradient-to-tl from-green to-blue text-5xl font-black text-white">
          +
        </div>
        <div>
          <span className="font-xs font-semibold italic text-purple">
            @newclub
          </span>
          <h3 className="text-2xl font-bold">Your club name here</h3>
          <p>
            Scrapook is better with friends. Be the first one to make a
            club!
          </p>
        </div>
      </div>
      <Link to={routes.newClub()} className="text-right font-bold text-slate">
        NEW CLUB, NOW!
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ clubs }: CellSuccessProps<FindClubs>) => {
  return <Clubs clubs={clubs} />
}
