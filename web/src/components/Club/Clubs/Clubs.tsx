import humanize from 'humanize-string'

import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

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

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Slug</th>
            <th>Name</th>
            <th>Logo</th>
            <th>Custom domain</th>
            <th>Css url</th>
            <th>Website</th>
            <th>Github</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {clubs.map((club) => (
            <tr key={club.id}>
              <td>{truncate(club.id)}</td>
              <td>{truncate(club.slug)}</td>
              <td>{truncate(club.name)}</td>
              <td>{truncate(club.logo)}</td>
              <td>{truncate(club.customDomain)}</td>
              <td>{truncate(club.cssURL)}</td>
              <td>{truncate(club.website)}</td>
              <td>{truncate(club.github)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.club({ id: club.id })}
                    title={'Show club ' + club.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
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
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ClubsList
