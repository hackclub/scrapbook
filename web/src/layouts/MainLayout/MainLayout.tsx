import { Link, routes } from '@redwoodjs/router'
import {  useAuth } from '@redwoodjs/auth'

type UpdateLayoutProps = {
  children: React.ReactNode
}

const UpdatesLayout = ({ children }: UpdateLayoutProps) => {
  const { isAuthenticated, currentUser, logOut } = useAuth()
  return (
    <div>
      <header className="flex p-4 gap-3 mb-2">
        <img src="https://github.com/hackclub.png" className="h-8 rounded-md" />
        <h1 className="rw-heading rw-heading-primary flex-grow">
          <Link
            to={routes.home()}
            className="rw-link"
          >
            Scrapbook
          </Link>
        </h1>
        {isAuthenticated ? 
        <> 
          <a
            href="https://github.com/hackclub/scrapbook"
            className="rw-button bg-slate-900 text-gray-100 hover:bg-slate-700"
            target="_blank"
          >
            GitHub
          </a>
          <Link
            to={routes.newUpdate()}
            className="rw-button bg-green-800 text-gray-100 hover:bg-green-600"
          >
            Create
          </Link>
          <Link
            to={routes.editAccount()}
            className="rw-button bg-blue-800 text-gray-100 hover:bg-blue-600"
          >
            Edit Account
          </Link>
          <div
            className="rw-button bg-red-900 text-gray-100 hover:bg-red-700"
            onClick={logOut}
          >
            Logout
          </div>
        </> : 
        <>
          <a
            href="https://github.com/hackclub/scrapbook"
            className="rw-button bg-slate-900 text-gray-100 hover:bg-slate-700"
            target="_blank"
          >
            GitHub
          </a>
          <Link
            to={routes.login()}
            className="rw-button bg-green-800 text-gray-100 hover:bg-green-600"
          >
            Login
          </Link>
        </> }
      </header>
      <main className="rw-main">{children}</main>
    </div>
  )
}

export default UpdatesLayout
