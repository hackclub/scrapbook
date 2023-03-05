import React from 'react'
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
import Nav from '../components/nav'
import NProgress from '../components/nprogress'
import { SessionProvider } from 'next-auth/react'

const App = ({ Component, pageProps }) => (
  <SessionProvider>
    <Nav />
    <NProgress color={'#ec3750'} />
    <Component {...pageProps} />
    <Analytics />
  </SessionProvider>
)

export default App
