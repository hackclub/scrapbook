import UpdatesCell from 'src/components/Update/UpdatesCell'
interface UserPageProps {
  username: string
}

const UserPage: React.FC<UserPageProps> = ({ username }) => {
  return <UpdatesCell username={username} />
}

export default UserPage
