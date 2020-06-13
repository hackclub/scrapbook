import * as React from 'react'
import NextApp from 'next/app'

import '@hackclub/theme/fonts/reg-bold.css'
import '../public/app.css'
import 'react-lazy-load-image-component/src/effects/blur.css'
import Flag from '../components/flag'

export default class App extends NextApp {
  render() {
    const { Component, pageProps } = this.props
    return (
      <>
        <Flag />
        <Component {...pageProps} />
      </>
    )
  }
}
