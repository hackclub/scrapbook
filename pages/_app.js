import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from 'next-auth/react'
import Nav from '../components/nav'
import NProgress from '../components/nprogress'
import Analytics from '../components/analytics'
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
  const [tour, setTour] = useState(true)
  const Tour = dynamic(() => import('reactour'), {
    ssr: false
  })
  return (
    <SessionProvider>
      <Toaster />
      <Nav />
      <NProgress color={'#ec3750'} />
      <Component {...pageProps} />
      <Tour
        steps={[
          {
            selector: '',
            content: 'This is my first Step'
          },
          {
            selector: '.nav-link-about',
            content: 'This is my second Step'
          }
        ]}
        isOpen={tour}
        onRequestClose={() => setTour(false)}
      />
      <Analytics />
    </SessionProvider>
  )
}

export default App
