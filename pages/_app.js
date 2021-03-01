import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import NextApp from 'next/app'

import '../public/fonts.css'
import '../public/app.css'
import '../public/themes/default.css'
import Nav from '../components/nav'
import * as Fathom from 'fathom-client'
import NProgress from '../components/nprogress'

const App = ({ Component, pageProps }) => {
  const router = useRouter()

  useEffect(() => {
    Fathom.load('LQTGBZMY', { includedDomains: ['scrapbook.hackclub.com'] })
    const onRouteChangeComplete = () => Fathom.trackPageview()
    router.events.on('routeChangeComplete', onRouteChangeComplete)
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [])

  return (
    <>
      <Nav />
      <NProgress color={'#ec3750'} />
      <Component {...pageProps} />
    </>
  )
}

export default App
