import type { EditUpdateById, UpdateUpdateInput } from 'types/graphql'

import { navigate, routes } from '@redwoodjs/router'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import UpdateForm from 'src/components/Update/UpdateForm'

export const QUERY = gql`
  query EditUpdateById($id: String!) {
    update: update(id: $id) {
      id
      accountsID
      postTime
      text
      attachments
      muxAssetIDs
      muxPlaybackIDs
      muxAssetStatuses
      messageTimestamp
      backupAssetID
      backupPlaybackID
      isLargeVideo
      channel
      clubscrapID
    }
  }
`
const UPDATE_UPDATE_MUTATION = gql`
  mutation UpdateUpdateMutation($id: String!, $input: UpdateUpdateInput!) {
    updateUpdate(id: $id, input: $input) {
      id
      accountsID
      postTime
      text
      attachments
      muxAssetIDs
      muxPlaybackIDs
      muxAssetStatuses
      messageTimestamp
      backupAssetID
      backupPlaybackID
      isLargeVideo
      channel
      clubscrapID
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ update }: CellSuccessProps<EditUpdateById>) => {
  const [updateUpdate, { loading, error }] = useMutation(
    UPDATE_UPDATE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Update updated')
        navigate(routes.updates())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (
    input: UpdateUpdateInput,
    id: EditUpdateById['update']['id']
  ) => {
    updateUpdate({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Update {update?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <UpdateForm
          update={update}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
