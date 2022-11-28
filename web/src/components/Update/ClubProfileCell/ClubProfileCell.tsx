import type { FindClubBySlug } from 'types/graphql'
import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'
import { Head } from '@redwoodjs/web'
import UpdatesCell from '../UpdatesCell'
import { contextDataType } from '../Updates'

export const QUERY = gql`
  query FindClubBySlug($slug: String!) {
    clubBySlug(slug: $slug) {
      id
      name
      logo
      slug
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
    <div className="masonary-item height-100 flex rounded-md border border-sunken bg-background p-3">
      <img src={contextData.logo} className="mr-4 h-16 rounded-md" />
      <div className="flex flex-col justify-center">
        <p className="text-gray-800 text-2xl font-black">{contextData.name}</p>
        <p className="text-gray-800 text-md">/{contextData.slug}</p>
      </div>
    </div>
  )
}

export const Success = ({ clubBySlug }: CellSuccessProps<FindClubBySlug>) => {
  return (
    <>
      <UpdatesCell
        club={clubBySlug.id}
        contextData={clubBySlug}
        Context={Context}
      />
    </>
  )
}
