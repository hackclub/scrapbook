import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Router, useRouter } from 'next/router'
import Icon from '@hackclub/icons'
import Flag from './flag'
import { getProviders, signIn, signOut, useSession } from "next-auth/react"
import Profile from './profile'
import { emailToPfp } from '../lib/email'

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

const SignOut = ({session, setMenuOpen}) => (
  <>
    <span className="badge" onClick={() => signOut()}>
      Sign-out
      <style>{badgeStyles}</style>
    </span>
    <img 
      src={emailToPfp(session.user.email)} 
      onClick={()=> setMenuOpen(true)}
      style={{
        height: '28px', 
        borderRadius: '999px', 
        marginLeft: '16px', 
        cursor: 'pointer',
        border: '1px solid var(--muted)'
      }} 
    />
  </>
)

const Nav = () => {
  const { pathname, query } = useRouter()
  const { data: session, status } = useSession()
  const home = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)
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
    <>
      {
        query.checkYourEmail !== undefined &&
        <div style={{background: 'var(--purple)', textAlign: 'center', padding: '8px'}}>
          <b>Where now? Head to your email for a unique URL to login.</b>
        </div>
      }
      {
        query.successfullySaved !== undefined &&
        <div style={{background: 'var(--green)', textAlign: 'center', padding: '8px'}}>
          <b>Profile saved successfully; nice update!</b>
        </div>
      }
      {
        query.errorTryAgain !== undefined &&
        <div style={{background: 'var(--red)', textAlign: 'center', padding: '8px'}}>
          <b>Oh-no! Something errored on our end, please try again.</b>
        </div>
      }
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
        {status === "authenticated" ? <>
          <SignOut session={session} setMenuOpen={setMenuOpen} />
          <Profile closed={!menuOpen} setMenuOpen={setMenuOpen} session={session} />
        </> : <SignIn />}
      </nav>
    </>
  )
}

export default Nav
