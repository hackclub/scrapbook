import React from 'react'
import { Box } from 'theme-ui'
import { keyframes } from '@emotion/core'

const slideUp = keyframes({
  from: { transform: 'translateY(100%)', opacity: 0 },
  to: { transform: 'translateY(0)', opacity: 1 }
})

const SlideUp = ({ duration = 300, delay = 0, ...props }) => (
  <Box
    {...props}
    sx={{
      ...(props.sx || {}),
      '@media (prefers-reduced-motion: no-preference)': {
        animationName: slideUp,
        animationFillMode: 'backwards',
        animationDuration: duration + 'ms',
        animationDelay: delay + 'ms'
      }
    }}
  />
)

export default SlideUp
