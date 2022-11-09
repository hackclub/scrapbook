import UpdatesCell from 'src/components/Update/UpdatesCell'
interface ReactionPageProps {
  emoji: string
}

const ReactionPage: React.FC<ReactionPageProps> = ({ emoji }) => {
  return (
    <>
      <h1 className="mb-3 text-4xl font-semibold">r/{emoji}</h1>
      <UpdatesCell reaction={emoji} />
    </>
  )
}

export default ReactionPage
