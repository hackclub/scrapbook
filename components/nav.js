import Link from 'next/link'
import Icon from '@hackclub/icons'
import Flag from './flag'

const Nav = () => (
  <nav className="nav">
    <Flag />
    <Link href="/">
      <a className="nav-link nav-link-home">Scrapbook</a>
    </Link>
    <Link href="/about">
      <a className="nav-link">About</a>
    </Link>
    <a
      href="https://github.com/hackclub/summer-scrapbook"
      className="nav-link nav-link-github"
      title="GitHub"
    >
      <Icon glyph="github" size={32} />
    </a>
  </nav>
)

export default Nav
