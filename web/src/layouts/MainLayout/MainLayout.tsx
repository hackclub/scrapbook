import { useAuth } from '@redwoodjs/auth'
import { Link, routes, useLocation } from '@redwoodjs/router'
import { Toaster } from '@redwoodjs/web/dist/toast'

type UpdateLayoutProps = {
  children: React.ReactNode
}

const UpdatesLayout = ({ children }: UpdateLayoutProps) => {
  const { isAuthenticated, currentUser, logOut } = useAuth()
  const { pathname, search, hash } = useLocation()
  return (
    <div>
      <Toaster />
      <header className="mb-2 flex gap-3 p-4">
        <img
          src="https://cloud-8166dq0ub-hack-club-bot.vercel.app/02022-github-complex__3_.png"
          alt="Hack Club"
          className="h-8 rounded-md"
        />
        <h1 className="rw-heading rw-heading-primary fonts-header flex-grow">
          {pathname == '/' ? (
            <>
              <a
                href="https://hackclub.com"
                target="_blank"
                className="text-slate hover:underline"
              >
                Hack Club
              </a>{' '}
              <i className="uppercase text-blue">(Beta-0.0.1)</i>
            </>
          ) : (
            <>
              <Link to={routes.home()} className="text-slate hover:underline">
                Hack Club's Scrapbook
              </Link>{' '}
              <i className="uppercase text-blue">(Beta-0.0.1)</i>
            </>
          )}
        </h1>
        {isAuthenticated ? (
          <>
            <a
              href="https://gist.github.com/sampoder/dad40f317af155ff0127150da252c4d6"
              className="rw-button bg-slate-900 text-gray-100 hover:bg-orange"
              target="_blank"
              rel="noreferrer"
            >
              About
            </a>
            <a
              href="https://github.com/hackclub/scrapbook"
              className="rw-button bg-slate-900 text-gray-100 hover:bg-slate"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <Link
              to={routes.newUpdate()}
              className="rw-button bg-green-800 text-gray-100 hover:bg-green"
            >
              Create
            </Link>
            <Link
              to={routes.clubs()}
              className="rw-button bg-blue-800 text-gray-100 hover:bg-blue"
            >
              Clubs
            </Link>
            <Link
              to={routes.editAccount()}
              className="rw-button bg-blue-800 text-gray-100 hover:bg-purple"
            >
              Edit Account
            </Link>
            <button
              className="rw-button bg-red-900 text-gray-100 hover:bg-red"
              onClick={logOut}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a
              href="https://gist.github.com/sampoder/dad40f317af155ff0127150da252c4d6"
              className="rw-button bg-slate-900 text-gray-100 hover:bg-orange"
              target="_blank"
              rel="noreferrer"
            >
              About
            </a>
            <a
              href="https://github.com/hackclub/scrapbook"
              className="rw-button bg-slate-900 text-gray-100 hover:bg-slate"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <Link
              to={routes.login()}
              className="rw-button bg-green-800 text-gray-100 hover:bg-green"
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
