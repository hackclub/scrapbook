import EditClubCell from 'src/components/Club/EditClubCell'

type ClubPageProps = {
  id: string
}

const EditClubPage = ({ id }: ClubPageProps) => {
  return <EditClubCell id={id} />
}

export default EditClubPage
