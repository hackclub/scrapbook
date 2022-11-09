import { useAuth } from '@redwoodjs/auth'
import { Link, routes } from '@redwoodjs/router'

type UpdateLayoutProps = {
  children: React.ReactNode
}

const UpdatesLayout = ({ children }: UpdateLayoutProps) => {
  const { isAuthenticated, currentUser, logOut } = useAuth()
  return (
    <div>
      <header className="mb-2 flex gap-3 p-4">
        <img
          src="https://github.com/hackclub.png"
          alt="Hack Club"
          className="h-8 rounded-md"
        />
        <h1 className="rw-heading rw-heading-primary fonts-header flex-grow">
          <Link to={routes.home()} className="rw-link">
            Scrapbook
          </Link>
        </h1>
        {isAuthenticated ? (
          <>
            <a
              href="https://github.com/hackclub/scrapbook"
              className="rw-button bg-slate-900 text-gray-100 hover:bg-slate-700"
              target="_blank"
              rel="noreferrer"
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
              to={routes.clubs()}
              className="rw-button bg-blue-800 text-gray-100 hover:bg-blue-600"
            >
              Clubs
            </Link>
            <Link
              to={routes.editAccount()}
              className="rw-button bg-blue-800 text-gray-100 hover:bg-blue-600"
            >
              Edit Account
            </Link>
            <button
              className="rw-button bg-red-900 text-gray-100 hover:bg-red-700"
              onClick={logOut}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a
              href="https://github.com/hackclub/scrapbook"
              className="rw-button bg-slate-900 text-gray-100 hover:bg-slate-700"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <Link
              to={routes.login()}
              className="rw-button bg-green-800 text-gray-100 hover:bg-green-600"
            >
              Login
            </Link>
          </>
        )}
      </header>
      <main className="rw-main">{children}</main>
    </div>
  )
}

export default UpdatesLayout
