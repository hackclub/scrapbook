import React from 'react'
import Analytics from '../components/analytics'
import '../public/fonts.css'
import '../public/app.css'
import '../public/themes/default.css'
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
