import ClubMemberCell from 'src/components/ClubMember/ClubMemberCell'

type ClubMemberPageProps = {
  id: string
}

const ClubMemberPage = ({ id }: ClubMemberPageProps) => {
  return <ClubMemberCell id={id} />
}

export default ClubMemberPage
