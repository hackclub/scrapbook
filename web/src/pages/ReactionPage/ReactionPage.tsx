import UpdatesCell from 'src/components/Update/UpdatesCell'
interface ReactionPageProps {
  reaction: string
}

const ReactionPage: React.FC<ReactionPageProps> = ({ emoji }) => {
  return <><UpdatesCell reaction={emoji} /></>
}

export default ReactionPage
