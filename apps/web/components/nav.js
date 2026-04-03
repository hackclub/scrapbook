import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Icon from '@hackclub/icons'
import Flag from './flag'
import { signOut, useSession } from 'next-auth/react'
import { emailToPfp } from '../lib/email'
import { ClubsIcon } from './club-icon'
import toast from 'react-hot-toast'

const Profile = dynamic(() => import('./profile'), { ssr: false })
const ClubsPopup = dynamic(() =>
  import('./clubs-popup').then(module => module.ClubsPopup), { ssr: false }
)
const PostEditor = dynamic(() =>
  import('./post-editor').then(module => module.PostEditor), { ssr: false }
)

const badgeStyles = `
.badge {
  background-color: var(--colors-slate);
  color: var(--colors-white);
  border: 0;
  font: inherit;
  appearance: none;
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

const SignIn = ({ clickHandler }) => {
  return (
    <button
      type="button"
      className="badge"
      onClick={() => {
        clickHandler()
      }}
    >
      Sign-in
      <style>{badgeStyles}</style>
    </button>

  )
}

const SignOut = ({ session, setMenuOpen, setPostOpen, setClubsOpen }) => (
  <>
    <button
      type="button"
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
    <button
      type="button"
      onClick={() => setClubsOpen(true)}
      title="Clubs on Scrapbook"
      className="nav-link nav-link-github nav-link-clubs"
      aria-label="Clubs on Scrapbook"
    >
      <ClubsIcon size={24} />
    </button>
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
    <button type="button" className="badge" onClick={() => signOut()}>
      Sign-out
      <style>{badgeStyles}</style>
    </button>
  </>
)

const Nav = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const home = router?.pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const [postOpen, setPostOpen] = useState(false)
  const [clubsOpen, setClubsOpen] = useState(false)

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
          (
            <Link href="/" className='nav-link nav-link-home'>
              Scrapbook
            </Link>
          )}
        <Link href="/about/" passHref className='nav-link nav-link-about'>
          About
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
            {menuOpen && (
              <Profile
                closed={!menuOpen}
                setMenuOpen={setMenuOpen}
                session={session}
              />
            )}
            {postOpen && (
              <PostEditor
                closed={!postOpen}
                setPostOpen={setPostOpen}
                session={session}
              />
            )}
            {clubsOpen && (
              <ClubsPopup
                closed={!clubsOpen}
                setClubsOpen={setClubsOpen}
                session={session}
                loggedIn={true}
              />
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setClubsOpen(true)}
              title="Clubs on Scrapbook"
              className="nav-link nav-link-github nav-link-clubs"
              aria-label="Clubs on Scrapbook"
            >
              <ClubsIcon size={24} />
            </button>
            {clubsOpen && (
              <ClubsPopup
                closed={!clubsOpen}
                setClubsOpen={setClubsOpen}
                session={session}
                loggedIn={false}
              />
            )}
            <SignIn clickHandler={async () => {
              const repsonse = await fetch("/api/identity/start")
              const data = await repsonse.text();
              window.open(data, "_self");
            }} />
          </>
        )}
      </nav>
    </>
  )
}

export default Nav
