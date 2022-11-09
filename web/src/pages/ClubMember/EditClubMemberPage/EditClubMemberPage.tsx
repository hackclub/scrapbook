import EditClubMemberCell from 'src/components/ClubMember/EditClubMemberCell'

type ClubMemberPageProps = {
  id: string
}

const EditClubMemberPage = ({ id }: ClubMemberPageProps) => {
  return <EditClubMemberCell id={id} />
}

export default EditClubMemberPage
