import { Link, routes } from '@redwoodjs/router'
import { Toaster } from '@redwoodjs/web/toast'

type UpdateLayoutProps = {
  children: React.ReactNode
}

const UpdatesLayout = ({ children }: UpdateLayoutProps) => {
  return (
    <div className="rw-scaffold">
      <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
      <header className="rw-header">
        <h1 className="rw-heading rw-heading-primary">
          <Link to={routes.home()} className="rw-link">
            Updates
          </Link>
        </h1>
        <Link to={routes.newUpdate()} className="rw-button rw-button-green">
          <div className="rw-button-icon">+</div> New Update
        </Link>
      </header>
      <main className="rw-main">{children}</main>
    </div>
  )
}

export default UpdatesLayout
