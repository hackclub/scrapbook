import humanize from 'humanize-string'

import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import type { DeleteClubMutationVariables, FindClubById } from 'types/graphql'

const DELETE_CLUB_MUTATION = gql`
  mutation DeleteClubMutation($id: String!) {
    deleteClub(id: $id) {
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
  club: NonNullable<FindClubById['club']>
}

const Club = ({ club }: Props) => {
  const [deleteClub] = useMutation(DELETE_CLUB_MUTATION, {
    onCompleted: () => {
      toast.success('Club deleted')
      navigate(routes.clubs())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id: DeleteClubMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete club ' + id + '?')) {
      deleteClub({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Club {club.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{club.id}</td>
            </tr>
            <tr>
              <th>Slug</th>
              <td>{club.slug}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{club.name}</td>
            </tr>
            <tr>
              <th>Logo</th>
              <td>{club.logo}</td>
            </tr>
            <tr>
              <th>Custom domain</th>
              <td>{club.customDomain}</td>
            </tr>
            <tr>
              <th>Css url</th>
              <td>{club.cssURL}</td>
            </tr>
            <tr>
              <th>Website</th>
              <td>{club.website}</td>
            </tr>
            <tr>
              <th>Github</th>
              <td>{club.github}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editClub({ id: club.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(club.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default Club
