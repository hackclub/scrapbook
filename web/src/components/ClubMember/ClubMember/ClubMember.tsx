import humanize from 'humanize-string'

import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import type {
  DeleteClubMemberMutationVariables,
  FindClubMemberById,
} from 'types/graphql'

const DELETE_CLUB_MEMBER_MUTATION = gql`
  mutation DeleteClubMemberMutation($id: String!) {
    deleteClubMember(id: $id) {
      id
    }
  }
`

const formatEnum = (values: string | string[] | null | undefined) => {
  if (values) {
    if (Array.isArray(values)) {
      const humanizedValues = values.map((value) => humanize(value))
      return humanizedValues.join(', ')
    } else {
      return humanize(values as string)
    }
  }
}

const jsonDisplay = (obj: unknown) => {
  return (
    <pre>
      <code>{JSON.stringify(obj, null, 2)}</code>
    </pre>
  )
}

const timeTag = (datetime?: string) => {
  return (
    datetime && (
      <time dateTime={datetime} title={datetime}>
        {new Date(datetime).toUTCString()}
      </time>
    )
  )
}

const checkboxInputTag = (checked: boolean) => {
  return <input type="checkbox" checked={checked} disabled />
}

interface Props {
  clubMember: NonNullable<FindClubMemberById['clubMember']>
}

const ClubMember = ({ clubMember }: Props) => {
  const [deleteClubMember] = useMutation(DELETE_CLUB_MEMBER_MUTATION, {
    onCompleted: () => {
      toast.success('ClubMember deleted')
      navigate(routes.clubMembers())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteClubMemberMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete clubMember ' + id + '?')) {
      deleteClubMember({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            ClubMember {clubMember.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{clubMember.id}</td>
            </tr>
            <tr>
              <th>Account id</th>
              <td>{clubMember.accountId}</td>
            </tr>
            <tr>
              <th>Club id</th>
              <td>{clubMember.clubId}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editClubMember({ id: clubMember.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(clubMember.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default ClubMember
