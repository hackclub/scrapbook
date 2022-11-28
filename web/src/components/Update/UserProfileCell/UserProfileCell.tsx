import type { FindUserByUsername } from 'types/graphql'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'
import { Head } from '@redwoodjs/web'
import ReactAudioPlayer from 'react-audio-player'

import UpdatesCell from '../UpdatesCell'
import { contextDataType } from '../Updates'

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

const Context: React.FC<{ contextData: contextDataType }> = ({
  contextData,
}) => {
  return (
    <>
      <div className="masonary-item height-100 flex rounded-md border border-sunken bg-background p-3">
        <img src={contextData.avatar} className="mr-4 h-16 rounded-md" />
        <div className="flex flex-col justify-center">
          <p className="text-gray-800 text-2xl font-black">
            @{contextData.username}
          </p>
          <p className="text-gray-800 text-md">{contextData.pronouns}</p>
        </div>
      </div>
      {contextData.customAudioURL && (
        <div className="masonary-item height-100 flex rounded-md border border-sunken bg-background p-3">
          <ReactAudioPlayer
            src={contextData.customAudioURL}
            autoPlay
            loop
            controls
            preload="metadata"
          />
        </div>
      )}
    </>
  )
}

export const Success = ({
  accountByUsername,
}: CellSuccessProps<FindUserByUsername>) => {
  return (
    <>
      <Head>
        <link rel="stylesheet" href={accountByUsername.cssURL || ''} />
      </Head>
      <UpdatesCell
        username={accountByUsername.username}
        Context={Context}
        contextData={accountByUsername}
      />
    </>
  )
}
