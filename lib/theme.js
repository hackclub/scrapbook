import base from '@hackclub/theme'
import { merge } from 'lodash'

const theme = base

// Disable dark mode
theme.useColorSchemeMediaQuery = false
theme.colors.modes = {}

theme.lineHeights.limit = 0.875

// Temporary hack
theme.breakpoints = ['32em', '48em', '64em', '256em', '512em']

theme.util = {
  reduceMotion: '@media (prefers-reduced-motion: reduce)',
  supportsBackdrop:
    '@supports (-webkit-backdrop-filter: none) or (backdrop-filter: none)',
  supportsClip: '@supports (-webkit-background-clip: text)'
}

theme.util.cx = c => theme.colors[c] || c
theme.util.gradient = (from, to) => `radial-gradient(
  ellipse farthest-corner at top left,
  ${theme.util.cx(from)},
  ${theme.util.cx(to)}
)`
theme.util.gradientText = (from, to) => ({
  color: theme.util.cx(to),
  [theme.util.supportsClip]: {
    backgroundImage: theme.util.gradient(from, to),
    backgroundRepeat: 'no-repeat',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }
})

theme.badges.default = {
  variant: 'badges.pill',
  mt: 0,
  mr: 3,
  px: 3,
  bg: 'transparent',
  color: 'white',
  border: '1px solid',
  borderColor: 'currentColor',
  fontSize: 1,
  fontWeight: 'body'
}

theme.buttons.primary = {
  boxShadow: 'none',
  fontFamily: 'inherit',
  fontWeight: 'bold',
  letterSpacing: 'headline',
  textTransform: 'uppercase',
  WebkitTapHighlightColor: 'transparent',
  position: 'relative',
  bg: 'orange',
  backgroundImage: t => t.util.gradient('yellow', 'orange'),
  borderRadius: 'circle',
  boxShadow: 'card',
  transition: 'transform 250ms ease-in-out, box-shadow 250ms ease-in-out',
  ':hover,:focus': {
    boxShadow: 'elevated',
    transform: 'scale(1.125)'
  }
}
theme.buttons.cta = {
  variant: 'buttons.primary',
  fontSize: 3,
  px: 4,
  py: 2,
  lineHeight: 1.75
}

theme.cards.translucent = {
  // variant: 'cards.primary',
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  [theme.util.supportsBackdrop]: {
    backgroundColor: 'rgba(255, 255, 255, 0.875)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)'
  }
}
/*
theme.cards.translucentDark = {
  // variant: 'cards.primary',
  backgroundColor: 'rgba(0, 0, 0, 0.875)',
  [theme.util.supportsBackdrop]: {
    backgroundColor: 'rgba(0, 0, 0, 0.625)',
    backdropFilter: 'saturate(180%) blur(16px)',
    WebkitBackdropFilter: 'saturate(180%) blur(16px)'
  },
}
*/

theme.forms.input = merge(theme.forms.input, { boxShadow: 'none !important' })
theme.forms.textarea = { variant: 'forms.input' }
theme.forms.label = merge(theme.forms.label, {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  fontSize: 2,
  mb: 0
})
theme.forms.labelCheckbox = {
  variant: 'forms.label',
  flexDirection: 'row !important',
  alignItems: 'center',
  svg: { color: 'muted' }
}

theme.layout.copy.maxWidth = [null, null, 'copyPlus']

theme.text.lead = {
  fontSize: [2, 3]
}
theme.text.eyebrow = {
  color: 'muted',
  fontSize: [3, 4],
  fontWeight: 'heading',
  letterSpacing: 'headline',
  lineHeight: 'subheading',
  textTransform: 'uppercase',
  mt: 0,
  mb: 2
}
theme.text.title.fontSize[0] = 5
theme.text.titleUltra = {
  ...theme.text.title,
  fontSize: [5, 6, 7],
  lineHeight: 0.875
}

theme.text.subtitle.mt = 3

export default theme
