import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Icon from '@hackclub/icons'
import Flag from './flag'

const Join = () => (
  <a href="https://hackclub.com/slack/" className="badge">
    Join
    <style jsx>{`
      a {
        background-color: var(--colors-muted);
        color: var(--colors-background);
        padding: 3px 12px 1px;
        margin-left: 16px;
        text-decoration: none;
        text-transform: uppercase;
        transition: 0.125s background-color ease-in-out;
      }
      a:hover,
      a:focus {
        background-color: var(--colors-purple);
      }
    `}</style>
  </a>
)



const Nav = () => {
  const { pathname } = useRouter()
  const home = pathname === '/'
  // This is a hack for using the right link on custom domains
  const [ext, setExt] = useState(false)
  useEffect(() => {
    try {
      const l = document.createElement('a')
      l.href = window.location.href
      console.log(l.hostname)
      if (!l.hostname.includes('.hackclub.')) setExt(true)
    } catch (e) {}
  }, [])

  return (
    <nav className="nav">
      <Flag />
      {!home &&
        (ext ? (
          <a
            href="https://scrapbook.hackclub.com/"
            className="nav-link nav-link-home"
          >
            Scrapbook
          </a>
        ) : (
          <Link href="/">
            <a className="nav-link nav-link-home">Scrapbook</a>
          </Link>
        ))}
      <Link href="/about">
        <a className="nav-link nav-link-about">About</a>
      </Link>
      <a
        href="https://github.com/hackclub/summer-scrapbook"
        className="nav-link nav-link-github"
        title="GitHub"
      >
        <Icon glyph="github" size={32} />
      </a>
      {home && <Join />}
    </nav>
  )
}

export default Nav
