import type { FindUserByUsername } from 'types/graphql'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'
import ReactAudioPlayer from 'react-audio-player'

import UpdatesCell from '../UpdatesCell'

export const QUERY = gql`
  query FindUserByUsername($username: String!) {
    accountByUsername(username: $username) {
      username
      avatar
      cssURL
      pronouns
      customAudioURL
      streakCount
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div style={{ color: 'red' }}>Error: {error?.message}</div>
)

export const Success = ({
  accountByUsername,
}: CellSuccessProps<FindUserByUsername>) => {
  return (
    <>
      <link rel="stylesheet" href={accountByUsername.cssURL || ''} />
      <div className="border-gray-200 rounded-lg border px-4 py-2 mb-3">
        <img src={accountByUsername.avatar} />
        <p className="text-gray-800 text-xl font-black">
          {accountByUsername.username}
        </p>
        <p className="text-gray-500 text-xs font-bold lowercase">
          {accountByUsername.pronouns}
        </p>
        <p className="text-gray-500 text-xs font-bold lowercase">
          Streak: {accountByUsername?.streakCount}
        </p>
        {accountByUsername.customAudioURL && (
          <ReactAudioPlayer src={accountByUsername.customAudioURL} autoPlay loop controls preload="metadata" />
            )}
      </div>
      <UpdatesCell username={accountByUsername.username} />
    </>
  )
}
