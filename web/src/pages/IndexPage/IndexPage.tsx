import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'
import { useAuth } from '@redwoodjs/auth'

const IndexPage = () => {
  const { isAuthenticated, currentUser, logOut } = useAuth()
  if(isAuthenticated){
    return (
      <>
        <MetaTags title="Index" description="Index page" />
        <h1>The walls have fallen. Welcome.</h1>
        <p>
          Nothing lies here, yet.
        </p>
        <p>
          Want the walls back? Fair. <span style={{textDecoration: 'underline'}} onClick={logOut}>Rebuild the walls.</span>
        </p>
      </>
    )
  }
  else {
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
