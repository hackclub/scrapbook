import { Link, routes } from '@redwoodjs/router'
import { Toaster } from '@redwoodjs/web/toast'

type ClubMemberLayoutProps = {
  children: React.ReactNode
}

const ClubMembersLayout = ({ children }: ClubMemberLayoutProps) => {
  return (
    <div className="rw-scaffold">
      <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
      <header className="rw-header">
        <h1 className="rw-heading rw-heading-primary">
          <Link to={routes.clubMembers()} className="rw-link">
            ClubMembers
          </Link>
        </h1>
        <Link to={routes.newClubMember()} className="rw-button rw-button-green">
          <div className="rw-button-icon">+</div> New ClubMember
        </Link>
      </header>
      <main className="rw-main">{children}</main>
    </div>
  )
}

export default ClubMembersLayout
