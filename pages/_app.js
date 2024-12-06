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

const App = ({ Component, pageProps }) => {
  let router = useRouter()
  useEffect(() => {
    try {
      const l = document.createElement('a');
      l.href = window.location.href;
    } catch (e) {}
  }, []);
  
  return (
    <SessionProvider>
      <Toaster />
      {!router?.query?.embed && <Nav />}
      <NProgress color={'#ec3750'} />
      <Component {...pageProps} />
      <Analytics />
    </SessionProvider>
  )
}

export default App
