import EditAccountCell from 'src/components/Account/EditAccountCell'

import { useAuth } from '@redwoodjs/auth'

type AccountPageProps = {
  id: number
}

function EditAccountPage({ id }: AccountPageProps) {
  const { currentUser } = useAuth()
  if (!currentUser?.id) {
    return <>Loading...</>
  }
  return <EditAccountCell id={currentUser.id} />
}

export default EditAccountPage
