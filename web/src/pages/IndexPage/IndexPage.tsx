import {  Link,  routes } from '@redwoodjs/router'
import {  MetaTags } from '@redwoodjs/web'
import {  useAuth } from '@redwoodjs/auth'

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
