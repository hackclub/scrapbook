import React from 'react'
import { Box } from 'theme-ui'
import { keyframes } from '@emotion/core'

const fadeOut = (start, end) => keyframes({ from: { opacity: start }, to: { opacity: end } })

const FadeOut = ({ duration = 300, delay = 0, start = 1, end = 0, ...props }) => (
  <Box
    {...props}
    sx={{
      ...(props.sx || {}),
      '@media (prefers-reduced-motion: no-preference)': {
        animationName: fadeOut(start, end),
        animationFillMode: 'forwards',
        animationDuration: duration + 'ms',
        animationDelay: delay + 'ms'
      }
    }}
  />
)

export default FadeOut
