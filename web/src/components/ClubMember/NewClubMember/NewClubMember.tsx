import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useAuth } from '@redwoodjs/auth'

import ClubMemberForm from 'src/components/ClubMember/ClubMemberForm'

import type { CreateClubMemberInput } from 'types/graphql'

const CREATE_CLUB_MEMBER_MUTATION = gql`
  mutation CreateClubMemberMutation($input: CreateClubMemberInput!) {
    createClubMember(input: $input) {
      id
    }
  }
`

const NewClubMember = ( { slug } ) => {
  const [createClubMember, { loading, error }] = useMutation(
    CREATE_CLUB_MEMBER_MUTATION,
    {
      onCompleted: () => {
        toast.remove()
        toast.success('Club joined!')
        navigate(routes.club({slug: slug}))
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const { currentUser } = useAuth()

  const onSave = () => {
    toast.loading("Joining...")
    createClubMember({
      variables: {
        input: {
          accountId: currentUser.id,
          clubSlug: slug,
        },
      },
    })
  }

  return (
      <div style={{backgroundImage: 'url(https://cloud-cuw1vqjkd-hack-club-bot.vercel.app/0into-the-redwoods2.png)'}} className="h-96 w-96 bg-cover text-center p-3 mx-auto mt-3 rounded-md flex flex-col justify-center">
        <h1 className='text-white font-bold text-3xl'>
          An hacker's adventure awaits, it's time to join your club on Scrapbook.
        </h1>
        <ClubMemberForm onSave={onSave} loading={loading} error={error} />
      </div>
        
  )
}

export default NewClubMember
