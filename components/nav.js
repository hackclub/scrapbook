import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Router, useRouter } from 'next/router'
import Icon from '@hackclub/icons'
import Flag from './flag'
import { getProviders, signIn, signOut, useSession } from 'next-auth/react'
import Profile from './profile'
import { emailToPfp } from '../lib/email'
import { PostEditor } from './post-editor'
import { ClubsPopup } from './clubs-popup'
import { LoginPopup } from './login-popup'
import { ClubsIcon } from './club-icon'
import toast from 'react-hot-toast'

const Join = () => (
  <a href="https://hackclub.com/slack/" className="badge">
    Join
    <style>{badgeStyles}</style>
  </a>
)

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

const SignIn = ({ setLoginOpen }) => (
  <span
    className="badge"
    onClick={() => {
      setLoginOpen(true)
    }}
  >
    Sign-in
    <style>{badgeStyles}</style>
  </span>
)

const SignOut = ({ session, setMenuOpen, setPostOpen, setClubsOpen }) => (
  <>
    <span
      onClick={() => setPostOpen(true)}
      className="nav-link nav-link-github nav-link-post"
      style={{ marginLeft: '8px', marginRight: '-4px' }}
    >
      <Icon glyph="post-fill" size={38.2} />
    </span>
    <span
      onClick={() => setClubsOpen(true)}
      className="nav-link nav-link-github nav-link-clubs"
    >
      <ClubsIcon size={24} />
    </span>
    <img
      src={emailToPfp(session.user.email)}
      onClick={() => setMenuOpen(true)}
      className="nav-link-profile"
      style={{
        height: '28px',
        borderRadius: '999px',
        marginLeft: '16px',
        cursor: 'pointer',
        border: '1px solid var(--muted)'
      }}
    />
    <span className="badge" onClick={() => signOut()}>
      Sign-out
      <style>{badgeStyles}</style>
    </span>
  </>
)

const Nav = () => {
  const { pathname, query } = useRouter()
  const { data: session, status } = useSession()
  const home = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const [postOpen, setPostOpen] = useState(false)
  const [clubsOpen, setClubsOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  // This is a hack for using the right link on custom domains
  const [ext, setExt] = useState(false)
  useEffect(() => {
    if (query.checkYourEmail !== undefined) {
      toast('Where now? Head to your email for a unique URL to login.')
    } else if (query.successfullySaved !== undefined) {
      toast('Profile saved successfully; nice update!')
    } else if (query.successfullyPosted !== undefined) {
      toast("Post published successfully; it'll show up here soon!")
    } else if (query.errorTryAgain !== undefined) {
      toast('Oh-no! Something errored on our end, please try again.')
    }
  }, query)

  return (
    <>
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
              <a className="nav-link nav-link-home">
                Scrapbook
                <span className="beta-label">{" "}(Beta-V2)</span>
              </a>
            </Link>
          ))}
        <Link href="/about/" passHref>
          <a className="nav-link nav-link-about">About</a>
        </Link>
        <a
          href="https://github.com/hackclub/scrapbook"
          className="nav-link nav-link-github"
          title="GitHub"
          target="_blank"
        >
          <Icon glyph="github" size={32} />
        </a>
        {status === 'authenticated' ? (
          <>
            <SignOut
              session={session}
              setMenuOpen={setMenuOpen}
              setPostOpen={setPostOpen}
              setClubsOpen={setClubsOpen}
            />
            <Profile
              closed={!menuOpen}
              setMenuOpen={setMenuOpen}
              session={session}
            />
            <PostEditor
              closed={!postOpen}
              setPostOpen={setPostOpen}
              session={session}
            />
            <ClubsPopup
              closed={!clubsOpen}
              setClubsOpen={setClubsOpen}
              session={session}
            />
          </>
        ) : (
          <>
            <SignIn setLoginOpen={setLoginOpen} />
            <LoginPopup
              closed={!loginOpen}
              setLoginOpen={setLoginOpen}
              session={session}
            />
          </>
        )}
      </nav>
    </>
  )
}

export default Nav
