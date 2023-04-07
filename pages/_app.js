import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from 'next-auth/react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Nav from '../components/nav'
import NProgress from '../components/nprogress'
import Analytics from '../components/analytics'
import FourOhFour from './404'
import '../public/app.css'
import '../public/clubs.css'
import '../public/emoji-picker.css'
import '../public/fonts.css'
import '../public/heatmap.css'
import '../public/inputs.css'
import '../public/mentions.css'
import '../public/nav.css'
import '../public/overlay.css'
import '../public/posts.css'
import '../public/profiles.css'
import '../public/reactour.css'

const App = ({ Component, pageProps }) => {
  let router = useRouter()
  const [tour, setTour] = useState(true)
  const Tour = dynamic(() => import('reactour'), {
    ssr: false
  })
  // This is a hack for using the right link on custom domains
  const [ext, setExt] = useState(false)
  useEffect(() => {
    try {
      const l = document.createElement('a');
      l.href = window.location.href;
      if (!l.hostname.includes("hackclub.dev") && l.hostname != "scrapbook.hackclub.com" && l.pathname != "/") setExt(true);
    } catch (e) {}
  }, []);
  if(ext){
    return <FourOhFour />
  }
  return (
    <SessionProvider>
      <Toaster />
      {!router?.query?.embed && <Nav />}
      <NProgress color={'#ec3750'} />
      <Component {...pageProps} />
      {router.asPath.substring(0, 4) == '/new' && (
        <Tour
          steps={[
            {
              selector: '',
              content: `Why hello there??!! It's Scrappy here! 
                      Let me show you around my home: Scrapbook.`
            },
            {
              selector: '.nav-link-profile',
              content: (
                <span>
                  Everyone on here has a profile. You can customise yours by
                  clicking on your profile picture ( which is pulled from{' '}
                  <a
                    href="https://en.gravatar.com/"
                    target="_blank"
                    style={{ color: 'white' }}
                  >
                    Gravatar
                  </a>
                  ). That's pretty sweet, hey?{' '}
                </span>
              )
            },
            {
              selector: '.nav-link-post',
              content: (
                <>
                  Empty scrapbooks just aren't cool! Everytime you ship
                  something or make some progress on a project, you'll want to
                  make a post by clicking this button here - it's the one that
                  looks like a pencil and paper! Don't worry I'll allow you to
                  use a keyboard and mouse.
                </>
              )
            },
            {
              selector: '.nav-link-clubs',
              content: (
                <>
                  Occasionally, hackers gather in groups larger than one person
                  - they call them clubs. Clubs can create pages on Scrapbook
                  for members to post. Here you can view a list of them or
                  create a page for your own club.
                </>
              )
            },
            {
              selector: '',
              content: (
                <>
                  Unfortunately [for you], we've reached the end of my tour. I
                  know you've enjoyed it but, trust me, you'll enjoy Scrapbook
                  even more. Now,{' '}
                  <span
                    onClick={() => {
                      setTour(false)
                      router.push('/', { shallow: true, scroll: false })
                    }}
                    style={{ textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    go crazy
                  </span>
                  .
                </>
              )
            }
          ]}
          isOpen={tour}
          onRequestClose={() => setTour(false)}
        />
      )}
      <Analytics />
    </SessionProvider>
  )
}

export default App
