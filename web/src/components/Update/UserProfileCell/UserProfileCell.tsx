import type { FindUserByUsername } from 'types/graphql'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

import UpdatesCell from '../UpdatesCell'

export const QUERY = gql`
  query FindUserByUsername($username: String!) {
    accountByUsername(username: $username) {
      username
      email
      avatar
      cssURL
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
      <div className="border-gray-200 rounded-lg border px-4 py-2">
        <img src={accountByUsername.avatar} />
        <p className="text-gray-800 text-xl font-black">
          {accountByUsername.username}
        </p>
        <p className="text-gray-500 text-xs font-bold lowercase">
          {accountByUsername.email}
        </p>
      </div>
      <UpdatesCell username={accountByUsername.username} />
    </>
  )
}
