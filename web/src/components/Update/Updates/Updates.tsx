import humanize from 'humanize-string'

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

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Accounts slack id</th>
            <th>Post time</th>
            <th>Text</th>
            <th>Attachments</th>
            <th>Mux asset i ds</th>
            <th>Mux playback i ds</th>
            <th>Mux asset statuses</th>
            <th>Message timestamp</th>
            <th>Backup asset id</th>
            <th>Backup playback id</th>
            <th>Is large video</th>
            <th>Channel</th>
            <th>Clubscrap id</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {updates.map((update) => (
            <tr key={update.id}>
              <td>{truncate(update.id)}</td>
              <td>{truncate(update.accountsID)}</td>
              <td>{timeTag(update.postTime)}</td>
              <td>{truncate(update.text)}</td>
              <td>{formatEnum(update.attachments)}</td>
              <td>{formatEnum(update.muxAssetIDs)}</td>
              <td>{formatEnum(update.muxPlaybackIDs)}</td>
              <td>{truncate(update.muxAssetStatuses)}</td>
              <td>{truncate(update.messageTimestamp)}</td>
              <td>{truncate(update.backupAssetID)}</td>
              <td>{truncate(update.backupPlaybackID)}</td>
              <td>{checkboxInputTag(update.isLargeVideo)}</td>
              <td>{truncate(update.channel)}</td>
              <td>{truncate(update.clubscrapID)}</td>
              <td>
                <nav className="rw-table-actions">
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
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UpdatesList
