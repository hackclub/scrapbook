import type { FindUpdateById } from 'types/graphql'

import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

import Update from 'src/components/Update/Update'

export const QUERY = gql`
  query FindUpdateById($id: String!) {
    update: update(id: $id) {
      id
      accountID
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

export const Empty = () => <div>Update not found</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ update }: CellSuccessProps<FindUpdateById>) => {
  return <Update update={update} />
}
