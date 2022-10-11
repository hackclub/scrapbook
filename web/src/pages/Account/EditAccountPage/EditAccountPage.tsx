import { useAuth } from '@redwoodjs/auth'

import EditAccountCell from 'src/components/Account/EditAccountCell'

function EditAccountPage() {
  const { currentUser } = useAuth()
  if (!currentUser?.id) {
    return <>Loading...</>
  }
  return <EditAccountCell id={currentUser.id} />
}

export default EditAccountPage
