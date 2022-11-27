import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useAuth } from '@redwoodjs/auth'

import { QUERY } from 'src/components/Club/ClubsCell'

import type { DeleteClubMutationVariables, FindClubs } from 'types/graphql'

const DELETE_CLUB_MUTATION = gql`
  mutation DeleteClubMutation($id: String!) {
    deleteClub(id: $id) {
      id
    }
  }
`

const MAX_STRING_LENGTH = 150

const truncate = (value: string | number) => {
  const output = value?.toString()
  if (output?.length > MAX_STRING_LENGTH) {
    return output.substring(0, MAX_STRING_LENGTH) + '...'
  }
  return output ?? ''
}

const ClubsList = ({ clubs }: FindClubs) => {
  const [deleteClub] = useMutation(DELETE_CLUB_MUTATION, {
    onCompleted: () => {
      toast.success('Club deleted')
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

  const onDeleteClick = (id: DeleteClubMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete club ' + id + '?')) {
      deleteClub({ variables: { id } })
    }
  }

  const { currentUser } = useAuth()

  return (
    <>
      {' '}
      <div className="rw-segment rw-table-wrapper-responsive">
        <table className="rw-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Name</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((club) => (
              <tr key={club.id}>
                <td>
                  <img src={club.logo} className="h-32 rounded" />
                </td>
                <td>{truncate(club.name)}</td>
                <td>
                  <nav className="rw-table-actions">
                    <Link
                      to={routes.club({ slug: club.slug })}
                      title={'Show club ' + club.slug + ' detail'}
                      className="rw-button rw-button-small"
                    >
                      Show
                    </Link>
                    {club.members
                      .filter((x) => x.admin)
                      .map((x) => x.accountId)
                      .includes(currentUser.id) && (
                      <>
                        <Link
                          to={routes.editClub({ id: club.id })}
                          title={'Edit club ' + club.id}
                          className="rw-button rw-button-small rw-button-blue"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          title={'Delete club ' + club.id}
                          className="rw-button rw-button-small rw-button-red"
                          onClick={() => onDeleteClick(club.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </nav>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link to={routes.newClub()} className="rw-button rw-button-green mt-3">
        <div className="rw-button-icon">+</div> New Club
      </Link>
    </>
  )
}

export default ClubsList
