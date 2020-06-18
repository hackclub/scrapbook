import Link from 'next/link'
import { useRouter } from 'next/router'
import Icon from '@hackclub/icons'
import Flag from './flag'

const Join = () => {
  const { pathname } = useRouter()
  return pathname === '/' ? (
    <a href="https://hackclub.com/slack/" className="badge">
      Join
      <style jsx>{`
        a {
          background-color: var(--colors-muted);
          padding: 3px 12px 1px;
          margin-left: 16px;
          text-decoration: none;
          text-transform: uppercase;
          color: #fff;
          transition: 0.125s background-color ease-in-out;
        }
        a:hover,
        a:focus {
          background-color: var(--colors-purple);
        }
      `}</style>
    </a>
  ) : null
}

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
    <Join />
  </nav>
)

export default Nav
