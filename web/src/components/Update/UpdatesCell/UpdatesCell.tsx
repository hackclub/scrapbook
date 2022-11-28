import type { FindUpdates } from 'types/graphql'

import { Link, routes } from '@redwoodjs/router'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'
import { contextDataType } from '../Updates'
import Updates from 'src/components/Update/Updates'
import React from 'react'

export const QUERY = gql`
  query FindUpdates($username: String, $reaction: String, $club: String) {
    updates(
      filter: {
        account: { username: $username }
        reactions: {
          some: { emojiName: $reaction, accountsReacted: { isEmpty: false } }
        }
        associatedClub: { clubId: $club }
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
    <div
      className="flex items-center justify-center rounded-lg text-center text-4xl font-bold text-white"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(5, 11, 20, 0.8) 0%, rgba(5, 11, 20, 0.8) 100% ), url(https://cloud-252jvz0gp-hack-club-bot.vercel.app/0download__7_.png)',
        height: '300px',
        backgroundSize: 'cover',
      }}
    >
      {'No updates yet. '}{' '}
      <Link to={routes.newUpdate()} className="text-blue ml-2 no-underline hover:underline">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({
  updates,
  Context,
  contextData,
}: CellSuccessProps<FindUpdates> & {
  Context?: React.FC<{ contextData: contextDataType }>
  contextData?: contextDataType
}) => {
  return (
    <Updates updates={updates} Context={Context} contextData={contextData} />
  )
}
