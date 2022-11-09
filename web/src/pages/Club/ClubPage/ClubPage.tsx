import ClubCell from 'src/components/Club/ClubCell'

type ClubPageProps = {
  id: string
}

const ClubPage = ({ id }: ClubPageProps) => {
  return <ClubCell id={id} />
}

export default ClubPage
