import base from '@hackclub/theme'
import { merge } from 'lodash'

const theme = base

theme.styles.root.bg = 'sunken'

theme.lineHeights.limit = 0.875

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
