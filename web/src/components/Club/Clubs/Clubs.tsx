import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { Link, routes } from '@redwoodjs/router'
import { useAuth } from '@redwoodjs/auth'
import { QUERY } from 'src/components/Club/ClubsCell'

import type { DeleteClubMutationVariables, FindClubs } from 'types/graphql'

const DELETE_CLUB_MUTATION = gql`
  mutation DeleteClubMutation($id: String!) {
    deleteClub(id: $id) {
      id
    }
  }
`

const MAX_STRING_LENGTH = 70

const truncate = (value: string | number) => {
  const output = value?.toString()
  if (output?.length > MAX_STRING_LENGTH) {
    return output.substring(0, MAX_STRING_LENGTH) + '...'
  }
  return output ?? ''
}

const ClubsList = ({ clubs }: FindClubs) => {
  const { currentUser } = useAuth()
  const [deleteClub] = useMutation(DELETE_CLUB_MUTATION, {
    onCompleted: () => {
      toast.success('Club deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id: DeleteClubMutationVariables['id']) => {
    if (confirm('Are you sure you want to delete club ' + id + '?')) {
      deleteClub({ variables: { id } })
    }
  }
  return (
    <>
      <main
        className="masonary"
        style={{ height: `${1000 * Math.floor((clubs.length + 1) / 3) + 1}px` }}
      >
        <Link
            to={routes.newClub()}
          key="newclub_noid"
          className="masonary-item height-100 flex flex-col rounded-md border border-sunken bg-background p-3"
        >
          <div className="flex flex-row">
            <div className="mr-4 flex h-24 w-24 items-center justify-center bg-gradient-to-tl from-green to-blue text-5xl font-black text-white">
              +
            </div>
            <div>
              <span className="font-xs font-semibold italic text-purple">
                @newclub
              </span>
              <h3 className="text-2xl font-bold">Your club name here</h3>
              <p>Scrapook&apos;s better with friends. Make a club now!</p>
            </div>
          </div>
        </Link>
        {clubs.map((club) => (
          <div
            key={club.id}
            className="masonary-item height-100 flex flex-col rounded-md border border-sunken bg-background p-3"
          >
           
              <div className="flex flex-row">
                <Link to={routes.newClub()} className="mr-4 h-24 !w-24 flex-shrink-0">
                <img
                  className="h-100 w-100"
                  src={club.logo}
                  alt={`${club.name}'s logo`}
                /></Link>
                <div>
                  <Link
            to={routes.newClub()} className="font-xs font-semibold italic text-purple">
                    /{club.slug}
                  </Link>
                  <h3 className="text-2xl font-bold">{club.name}</h3>
                  <p>{truncate(club.description)}</p>
                </div>
              </div>

              {club.members
                .filter((x) => x.admin)
                .map((x) => x.accountId)
                .includes(currentUser.id) && (
<>
                <span className='text-center border-t mt-2 border-sunken pt-2'>
                  
                  <Link
                    to={routes.editClub({ id: club.id })}
                    title={'Edit club ' + club.id}
                    className="text-right font-bold text-blue uppercase mr-2"
                  >
                    Modify
                  </Link>
                  <span
                    onClick={() => onDeleteClick(club.id)}
                    title={'Edit club ' + club.id}
                    className="text-right font-bold text-red uppercase"
                  >
                    Delete Club
                  </span>
                </span>
                <Link to={routes.joinClub({slug: club.slug})} className="mx-auto">
                <small
                className=" text-slate uppercase text-center mx-auto"
              >
                v2.scrapbook.hackclub.com/join/{club.slug}
              </small></Link></>
              )}
             
          </div>
        ))}
      </main>
    </>
  )
}

export default ClubsList
