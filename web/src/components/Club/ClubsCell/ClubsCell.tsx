import type { FindClubs } from 'types/graphql'

import { Link, routes } from '@redwoodjs/router'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

import Clubs from 'src/components/Club/Clubs'

export const QUERY = gql`
  query FindClubs {
    clubs {
      id
      slug
      name
      logo
      customDomain
      cssURL
      website
      github
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No clubs yet. '}
      <Link
        to={routes.newClub()}
        className="rw-link"
      >
        {'Create one?'}
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
