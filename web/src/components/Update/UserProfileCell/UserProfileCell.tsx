import type { FindUserByUsername } from 'types/graphql'

import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

// hey there :D

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
      <link
        rel="stylesheet"
        href={
          'https://gist.githubusercontent.com/LuizWeitz/746f480244d80ac1f628cdf3e6233272/raw/b9b24066b67a5ab0ee76b0d0e866209ac1abbbea/style.css'
        }
      />
      <div className="border-gray-200 rounded-lg border px-4 py-2">
        <img src={accountByUsername.avatar} />
        <p className="text-gray-800 text-xl font-black">
          {accountByUsername.username}
        </p>
        <p className="text-gray-500 text-xs font-bold lowercase">
          {accountByUsername.email}
        </p>
      </div>
    </>
  )
}
