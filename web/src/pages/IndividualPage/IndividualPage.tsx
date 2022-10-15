import UpdatesCell from 'src/components/Update/UpdatesCell'
interface UpdatePageProps {
  username: string
}

const IndividualPage: React.FC<UpdatePageProps> = ({ username }) => {
  return <UpdatesCell username={username} />
}

export default IndividualPage
