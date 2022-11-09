import type { FindClubMembers } from 'types/graphql'

import { Link, routes } from '@redwoodjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
} from '@redwoodjs/web'

import ClubMembers from 'src/components/ClubMember/ClubMembers'

export const QUERY = gql`
  query FindClubMembers {
    clubMembers {
      id
      accountId
      clubId
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No clubMembers yet. '}
      <Link to={routes.newClubMember()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ clubMembers }: CellSuccessProps<FindClubMembers>) => {
  return <ClubMembers clubMembers={clubMembers} />
}
