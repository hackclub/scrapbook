import type { FindClubMemberById } from 'types/graphql'

import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

import ClubMember from 'src/components/ClubMember/ClubMember'

export const QUERY = gql`
  query FindClubMemberById($id: String!) {
    clubMember: clubMember(id: $id) {
      id
      accountId
      clubId
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>ClubMember not found</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ clubMember }: CellSuccessProps<FindClubMemberById>) => {
  return <ClubMember clubMember={clubMember} />
}
