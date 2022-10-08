import { Link, routes } from '@redwoodjs/router'
import { Toaster } from '@redwoodjs/web/toast'

type AccountLayoutProps = {
  children: React.ReactNode
}

const AccountsLayout = ({ children }: AccountLayoutProps) => {
  return (
    <div className="rw-scaffold">
      <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
      <header className="rw-header">
        <h1 className="rw-heading rw-heading-primary">
          <Link
            to={routes.accounts()}
            className="rw-link"
          >
            Accounts
          </Link>
        </h1>
        <Link
          to={routes.newAccount()}
          className="rw-button rw-button-green"
        >
          <div className="rw-button-icon">+</div> New Account
        </Link>
      </header>
      <main className="rw-main">{children}</main>
    </div>
  )
}

export default AccountsLayout
