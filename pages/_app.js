import React from 'react'

import Analytics from "../components/analytics"

import '../public/fonts.css'
import '../public/app.css'
import '../public/cartridge.css'
import '../public/themes/default.css'
import Nav from '../components/nav'
import NProgress from '../components/nprogress'

const App = ({ Component, pageProps }) => (
  <>
    <Nav />
    <NProgress color={'#ec3750'} />
    <Component {...pageProps} />
    <Analytics />
  </>
)

export default App
