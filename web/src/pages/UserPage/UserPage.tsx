import UpdatesCell from 'src/components/Update/UpdatesCell'
import UserProfileCell from 'src/components/Update/UserProfileCell'
interface UserPageProps {
  username: string
}

const UserPage: React.FC<UserPageProps> = ({ username }) => {
  return (
    <>
      <UserProfileCell username={username} />
      <UpdatesCell username={username} />
    </>
  )
}

export default UserPage
