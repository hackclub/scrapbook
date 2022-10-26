import type { FindUserByUsername } from 'types/graphql'

import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

// hey there :D

export const QUERY = gql`
  query FindUserByUsername($username: String!) {
    accountByUsername(username: $username) {
      username
      email
      avatar
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
    <div className="rounded-lg border border-gray-200 px-4 py-2">
      <img src={accountByUsername.avatar} />
      <p className="text-xl font-black text-gray-800">
        {accountByUsername.username}
      </p>
      <p className="text-xs font-bold lowercase text-gray-500">
        {accountByUsername.email}
      </p>
    </div>
  )
}
