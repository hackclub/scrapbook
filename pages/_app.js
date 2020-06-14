import * as React from 'react'
import NextApp from 'next/app'

import '@hackclub/theme/fonts/reg-bold.css'
import '../public/app.css'
import 'react-lazy-load-image-component/src/effects/blur.css'
import Nav from '../components/nav'

export default class App extends NextApp {
  render() {
    const { Component, pageProps } = this.props
    return (
      <>
        <Nav />
        <Component {...pageProps} />
      </>
    )
  }
}
