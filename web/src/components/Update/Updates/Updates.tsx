import humanize from 'humanize-string'
import {  useAuth } from '@redwoodjs/auth'
import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Update/UpdatesCell'

import type { DeleteUpdateMutationVariables, FindUpdates } from 'types/graphql'

const DELETE_UPDATE_MUTATION = gql`
  mutation DeleteUpdateMutation($id: String!) {
    deleteUpdate(id: $id) {
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

const UpdatesList = ({ updates }: FindUpdates) => {
  const [deleteUpdate] = useMutation(DELETE_UPDATE_MUTATION, {
    onCompleted: () => {
      toast.success('Update deleted')
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

  const onDeleteClick = (id: DeleteUpdateMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete update ' + id + '?')) {
      deleteUpdate({ variables: { id } })
    }
  }

  const { isAuthenticated, currentUser, logOut } = useAuth()

  return (
    <div className="rw-segment rw-table-wrapper-responsive border-b-0 grid grid-cols-3">
          {updates.map((update) => (
            <div key={update.id} className="border-r border-b p-3">
              <p className="mb-2">
                <b>
                  @{truncate(update.Accounts.username)}
                </b>
              </p>
              <p>
                {truncate(update.text)}
              </p>
              <div className="grid grid-cols-2">
                <img src={update.attachments[0]} className="bg-gray-200 border my-2 rounded-md" />
              </div>
              <div className='text-center text-gray-500'>
                {timeTag(update.postTime)}
              </div>
              {update.accountsID == currentUser?.id &&
              <nav className="rw-table-actions justify-center mt-2 mb-1">
                <Link
                  to={routes.update({ id: update.id })}
                  title={'Show update ' + update.id + ' detail'}
                  className="rw-button rw-button-small"
                >
                  Show
                </Link>
                <Link
                  to={routes.editUpdate({ id: update.id })}
                  title={'Edit update ' + update.id}
                  className="rw-button rw-button-small rw-button-blue"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  title={'Delete update ' + update.id}
                  className="rw-button rw-button-small rw-button-red"
                  onClick={() => onDeleteClick(update.id)}
                >
                  Delete
                </button>
              </nav>}
            </div>
          ))}
    </div>
  )
}

export default UpdatesList
