import type { EditClubMemberById, UpdateClubMemberInput } from 'types/graphql'

import { navigate, routes } from '@redwoodjs/router'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ClubMemberForm from 'src/components/ClubMember/ClubMemberForm'

export const QUERY = gql`
  query EditClubMemberById($id: String!) {
    clubMember: clubMember(id: $id) {
      id
      accountId
      clubId
    }
  }
`
const UPDATE_CLUB_MEMBER_MUTATION = gql`
  mutation UpdateClubMemberMutation(
    $id: String!
    $input: UpdateClubMemberInput!
  ) {
    updateClubMember(id: $id, input: $input) {
      id
      accountId
      clubId
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  clubMember,
}: CellSuccessProps<EditClubMemberById>) => {
  const [updateClubMember, { loading, error }] = useMutation(
    UPDATE_CLUB_MEMBER_MUTATION,
    {
      onCompleted: () => {
        toast.success('ClubMember updated')
        navigate(routes.clubMembers())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateClubMemberInput,
    id: EditClubMemberById['clubMember']['id']
  ) => {
    updateClubMember({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit ClubMember {clubMember?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <ClubMemberForm
          clubMember={clubMember}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
