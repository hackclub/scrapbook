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
  <button
    style={{
      position: "fixed",
      bottom: "2em",
      right: "2em",
      padding: "1em",
      zIndex: 10
    }}
    onClick={() => setPostOpen(true)}
    >
      <Icon glyph='post' size={38.2} />
      New Post
    </button>
    <span
      onClick={() => setClubsOpen(true)}
      title="Clubs on Scrapbook"
      className="nav-link nav-link-github nav-link-clubs"
    >
      <ClubsIcon size={24} />
    </span>
    <img
      src={session.user.avatar || emailToPfp(session.user.email)}
      onClick={() => setMenuOpen(true)}
      className="nav-link-profile"
      title="Edit Your Profile"
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
  let router = useRouter()
  const { data: session, status } = useSession()
  const home = router?.pathname === '/' ? true : false
  const [menuOpen, setMenuOpen] = useState(false)
  const [postOpen, setPostOpen] = useState(false)
  const [clubsOpen, setClubsOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  // This is a hack for using the right link on custom domains
  const [external, setExternal] = useState(false)

  useEffect(() => {
    try {
      const l = document.createElement('a');
      l.href = window.location.href;
      if (!l.hostname.includes("hackclub.dev") && l.hostname != "scrapbook.hackclub.com") setExternal(true);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (router?.query?.checkYourEmail !== undefined) {
      toast('Where now? Head to your email for a unique URL to login.')
    } else if (router?.query?.successfullySaved !== undefined) {
      toast('Profile saved successfully; nice update!')
    } else if (router?.query?.successfullyPosted !== undefined) {
      toast("Post published successfully; it'll show up here soon!")
    } else if (router?.query?.errorTryAgain !== undefined) {
      toast('Oh-no! Something errored on our end, please try again.')
    }
  }, [router?.query])

  return (
    <>
      <nav className="nav">
        <Flag />
        {!home &&
          (external ? (
            <a
              href="https://scrapbook.hackclub.com/"
              className="nav-link nav-link-home"
            >
              Scrapbook
            </a>
          ) : (
            <Link href="/" legacyBehavior>
              <a className="nav-link nav-link-home">
                Scrapbook
                <span className="beta-label"> (Beta-V2)</span>
              </a>
            </Link>
          ))}
        <Link href="/about/" passHref legacyBehavior>
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
              loggedIn={true}
            />
          </>
        ) : (
          !external && <>
            <span
              onClick={() => setClubsOpen(true)}
              title="Clubs on Scrapbook"
              className="nav-link nav-link-github nav-link-clubs"
            >
              <ClubsIcon size={24} />
            </span>
            <ClubsPopup
              closed={!clubsOpen}
              setClubsOpen={setClubsOpen}
              session={session}
              loggedIn={false}
            />
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
