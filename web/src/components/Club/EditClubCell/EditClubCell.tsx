import type { EditClubById, UpdateClubInput } from 'types/graphql'

import { navigate, routes } from '@redwoodjs/router'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ClubForm from 'src/components/Club/ClubForm'

export const QUERY = gql`
  query EditClubById($id: String!) {
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
const UPDATE_CLUB_MUTATION = gql`
  mutation UpdateClubMutation($id: String!, $input: UpdateClubInput!) {
    updateClub(id: $id, input: $input) {
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

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ club }: CellSuccessProps<EditClubById>) => {
  const [updateClub, { loading, error }] = useMutation(UPDATE_CLUB_MUTATION, {
    onCompleted: () => {
      toast.success('Club updated')
      navigate(routes.clubs())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSave = (input: UpdateClubInput, id: EditClubById['club']['id']) => {
    updateClub({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Club {club?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <ClubForm club={club} onSave={onSave} error={error} loading={loading} />
      </div>
    </div>
  )
}
