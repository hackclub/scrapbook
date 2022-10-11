import UpdatesCell from 'src/components/Update/UpdatesCell'

type UpdatePageProps = {
  username: string
}

const UpdatesPage = ({username}) => {
  return <UpdatesCell username={username} />
}

export default UpdatesPage
