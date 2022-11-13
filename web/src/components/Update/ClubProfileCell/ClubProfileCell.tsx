import type { FindClubBySlug } from 'types/graphql'
import type {
  CellSuccessProps,
  CellFailureProps,
} from '@redwoodjs/web'
import { Head } from '@redwoodjs/web'

import UpdatesCell from '../UpdatesCell'

export const QUERY = gql`
  query FindClubBySlug($slug: String!) {
    clubBySlug(slug: $slug) {
      id
      name
      logo
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Empty</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div style={{ color: 'red' }}>Error: {error?.message}</div>
)

export const Success = ({
  clubBySlug,
}: CellSuccessProps<FindClubBySlug>) => {
  return (
    <>
      <Head>
      </Head>
      <div className="border-gray-200 mb-3 rounded-lg border px-4 py-2">
        <img src={clubBySlug.logo} />
        <p className="text-gray-800 text-xl font-black">
          {clubBySlug.name}
        </p>
      </div>
      <UpdatesCell club={clubBySlug.id} />
    </>
  )
}
