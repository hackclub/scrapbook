import ClubProfileCell from 'src/components/Update/ClubProfileCell'
interface ClubPageProps {
  slug: string
}

const ClubPage: React.FC<ClubPageProps> = ({ slug }) => {
  return (
    <>
      <ClubProfileCell slug={slug} />
    </>
  )
}

export default ClubPage
