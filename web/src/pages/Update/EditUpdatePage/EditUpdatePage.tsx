import EditUpdateCell from 'src/components/Update/EditUpdateCell'

type UpdatePageProps = {
  id: string
}

const EditUpdatePage = ({ id }: UpdatePageProps) => {
  return <EditUpdateCell id={id} />
}

export default EditUpdatePage
