import { MetaTags } from '@redwoodjs/web'

import UpdatesCell from 'src/components/Update/UpdatesCell'

const IndexPage = () => {
  return (
    <>
      <MetaTags title="Index" description="Index page" />
      <div className="py-4">
        <h2 className='text-5xl font-header text-center mb-2'>
          Welcome to
        </h2>
        <h1 className='text-6xl font-header text-center mb-2'>
          Hack Club's Scrapbook
        </h1>
        <div className='text-2xl text-center mb-3'>
          A diary of everything being made and learnt in clubs, hackathons & the Slack.
        </div>
      </div>
      <UpdatesCell />
    </>
  )
}

export default IndexPage
