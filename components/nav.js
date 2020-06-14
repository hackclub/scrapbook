import Link from 'next/link'
import Flag from './flag'

const Nav = () => (
  <nav className="nav">
    <Flag />
    <aside className="nav-links">
      <Link href="/about">
        <a className="nav-link">About</a>
      </Link>
    </aside>
  </nav>
)

export default Nav
