import UpdatesCell from 'src/components/Update/UpdatesCell'
interface ReactionPageProps {
  emoji: string
}

const ReactionPage: React.FC<ReactionPageProps> = ({ emoji }) => {
  return (
    <>
      <UpdatesCell reaction={emoji} />
    </>
  )
}

export default ReactionPage
