import type { FindClubById } from 'types/graphql'

import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

import Club from 'src/components/Club/Club'

export const QUERY = gql`
  query FindClubById($id: String!) {
    club: club(id: $id) {
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

export const Empty = () => <div>Club not found</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ club }: CellSuccessProps<FindClubById>) => {
  return <Club club={club} />
}
