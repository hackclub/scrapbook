import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Icon from '@hackclub/icons'
import Flag from './flag'
import { getProviders, signIn, signOut, useSession } from "next-auth/react"

const Join = () => (
  <a href="https://hackclub.com/slack/" className="badge">
    Join
    <style>{badgeStyles}</style>
  </a>
)

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

const badgeStyles = `
.badge {
  background-color: var(--colors-muted);
  color: var(--colors-background);
  padding: 3px 12px 1px;
  margin-left: 16px;
  text-decoration: none;
  text-transform: uppercase;
  transition: 0.125s background-color ease-in-out;
  cursor: pointer;
}
.badge:hover,
.badge:focus {
  background-color: var(--colors-purple);
}`

const SignIn = () => (
  <span className="badge" onClick={() => {
    let email = prompt("👋 Wahoo! Welcome to Scrapbook, what's your email?")
    if(validateEmail(email)){
      signIn("email", { email })
    }
    else{
      alert("🚨 Oh-no! You've entered an invalid email.")
    }
  }}>
    Sign-in
    <style>{badgeStyles}</style>
  </span>
)

const SignOut = ({session}) => (
  <>
    <span className="badge" onClick={() => signOut()}>
      Sign-out
      <style>{badgeStyles}</style>
    </span>
    <img src={`https://unavatar.io/${session.user.email}`} style={{height: '28px', borderRadius: '999px', marginLeft: '16px'}} />
  </>
)

const Nav = () => {
  const { pathname } = useRouter()
  const { data: session, status } = useSession()
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
      <Link href="/about/" passHref>
        <a className="nav-link nav-link-about">About</a>
      </Link>
      <a
        href="https://github.com/hackclub/scrapbook"
        className="nav-link nav-link-github"
        title="GitHub"
      >
        <Icon glyph="github" size={32} />
      </a>
      {home && <Join />}
      {status === "authenticated" ? <SignOut session={session} /> : <SignIn />}
    </nav>
  )
}

export default Nav
