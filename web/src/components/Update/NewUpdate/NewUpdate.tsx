import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useAuth } from '@redwoodjs/auth'

import UpdateForm from 'src/components/Update/UpdateForm'

import type { CreateUpdateInput } from 'types/graphql'

const CREATE_UPDATE_MUTATION = gql`
  mutation CreateUpdateMutation($input: CreateUpdateInput!) {
    createUpdate(input: $input) {
      id
    }
  }
`

const NewUpdate = () => {

  const { isAuthenticated, currentUser, logOut } = useAuth()

  const [createUpdate, { loading, error }] = useMutation(
    CREATE_UPDATE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Update created')
        navigate(routes.updates())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input: CreateUpdateInput) => {
    console.log('server side!')
    createUpdate({ variables: { input: {accountsID: currentUser.id, ...input } }})
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Update</h2>
      </header>
      <div className="rw-segment-main">
        <UpdateForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewUpdate
