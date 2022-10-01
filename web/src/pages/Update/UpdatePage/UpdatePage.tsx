import UpdateCell from 'src/components/Update/UpdateCell'

type UpdatePageProps = {
  id: string
}

const UpdatePage = ({ id }: UpdatePageProps) => {
  return <UpdateCell id={id} />
}

export default UpdatePage
