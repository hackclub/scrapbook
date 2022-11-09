import { Link, routes } from '@redwoodjs/router'
import { Toaster } from '@redwoodjs/web/toast'

type ClubLayoutProps = {
  children: React.ReactNode
}

const ClubsLayout = ({ children }: ClubLayoutProps) => {
  return (
    <div className="rw-scaffold">
      <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
      <header className="rw-header">
        <h1 className="rw-heading rw-heading-primary">
          <Link
            to={routes.clubs()}
            className="rw-link"
          >
            Clubs
          </Link>
        </h1>
        <Link
          to={routes.newClub()}
          className="rw-button rw-button-green"
        >
          <div className="rw-button-icon">+</div> New Club
        </Link>
      </header>
      <main className="rw-main">{children}</main>
    </div>
  )
}

export default ClubsLayout
