import { MetaTags } from '@redwoodjs/web'

import UpdatesCell from 'src/components/Update/UpdatesCell'

const IndexPage = () => {
  return (
    <>
      <MetaTags title="Index" description="Index page" />
      <UpdatesCell />
    </>
  )
}

export default IndexPage
