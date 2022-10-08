import {  Link,  routes } from '@redwoodjs/router'
import {  MetaTags } from '@redwoodjs/web'
import {  useAuth } from '@redwoodjs/auth'

import UpdatesCell from 'src/components/Update/UpdatesCell'

const IndexPage = () => {
  const { isAuthenticated, currentUser, logOut } = useAuth()
  if (isAuthenticated) {
    return (
      <>
        <MetaTags title="Index" description="Index page" />
        <h1>The walls have fallen. Welcome.</h1>
        <p>
          Want the walls back? Fair.{' '}
          <span style={{ textDecoration: 'underline' }} onClick={logOut}>
            Rebuild the walls
          </span>{' '}
          or{' '}
          <Link
            to={routes.editAccount()}
            style={{ textDecoration: 'underline' }}
          >
            edit the walls
          </Link>
          .
        </p>
        <p>
          Below our some updates.{' '}
          <Link to={routes.newUpdate()}>You can create your own.</Link>
        </p>
        <br />
        <UpdatesCell />
      </>
    )
  } else {
    return (
      <>
        <MetaTags title="Index" description="Index page" />
        <h1>Behind these walls lies...</h1>
        <p>
          One must <Link to={routes.login()}>login</Link> to find out.
        </p>
      </>
    )
  }
}

export default IndexPage
