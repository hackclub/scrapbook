import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ClubMemberForm from 'src/components/ClubMember/ClubMemberForm'

import type { CreateClubMemberInput } from 'types/graphql'

const CREATE_CLUB_MEMBER_MUTATION = gql`
  mutation CreateClubMemberMutation($input: CreateClubMemberInput!) {
    createClubMember(input: $input) {
      id
    }
  }
`

const NewClubMember = () => {
  const [createClubMember, { loading, error }] = useMutation(
    CREATE_CLUB_MEMBER_MUTATION,
    {
      onCompleted: () => {
        toast.success('ClubMember created')
        navigate(routes.clubMembers())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateClubMemberInput) => {
    createClubMember({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New ClubMember</h2>
      </header>
      <div className="rw-segment-main">
        <ClubMemberForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewClubMember
