import humanize from 'humanize-string'

import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/ClubMember/ClubMembersCell'

import type {
  DeleteClubMemberMutationVariables,
  FindClubMembers,
} from 'types/graphql'

const DELETE_CLUB_MEMBER_MUTATION = gql`
  mutation DeleteClubMemberMutation($id: String!) {
    deleteClubMember(id: $id) {
      id
    }
  }
`

const MAX_STRING_LENGTH = 150

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

const truncate = (value: string | number) => {
  const output = value?.toString()
  if (output?.length > MAX_STRING_LENGTH) {
    return output.substring(0, MAX_STRING_LENGTH) + '...'
  }
  return output ?? ''
}

const jsonTruncate = (obj: unknown) => {
  return truncate(JSON.stringify(obj, null, 2))
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

const ClubMembersList = ({ clubMembers }: FindClubMembers) => {
  const [deleteClubMember] = useMutation(DELETE_CLUB_MEMBER_MUTATION, {
    onCompleted: () => {
      toast.success('ClubMember deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id: DeleteClubMemberMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete clubMember ' + id + '?')) {
      deleteClubMember({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Account id</th>
            <th>Club id</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {clubMembers.map((clubMember) => (
            <tr key={clubMember.id}>
              <td>{truncate(clubMember.id)}</td>
              <td>{truncate(clubMember.accountId)}</td>
              <td>{truncate(clubMember.clubId)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.clubMember({ id: clubMember.id })}
                    title={'Show clubMember ' + clubMember.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editClubMember({ id: clubMember.id })}
                    title={'Edit clubMember ' + clubMember.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete clubMember ' + clubMember.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(clubMember.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ClubMembersList
