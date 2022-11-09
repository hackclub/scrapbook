import type { FindUpdates } from 'types/graphql'

import { Link, routes } from '@redwoodjs/router'
import type {
  CellSuccessProps,
  CellFailureProps,
} from '@redwoodjs/web'

import Updates from 'src/components/Update/Updates'

export const QUERY = gql`
  query FindUpdates($username: String, $reaction: String) {
    updates(
      filter: {
        account: { username: $username }
        reactions: {
          some: { emojiName: $reaction, accountsReacted: { isEmpty: false } }
        }
      }
    ) {
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
      account {
        username
      }
      reactions {
        id
        emojiName
        emoji {
          source
          name
        }
        accountsReacted
      }
      channel
      clubscrapID
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No updates yet. '}
      <Link to={routes.newUpdate()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ updates }: CellSuccessProps<FindUpdates>) => {
  return <Updates updates={updates} />
}
