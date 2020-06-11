import theme from '../lib/theme'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/core'

const waveFlag = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(-5deg); }
`

const Base = styled('a')`
  display: inline-block;
  position: absolute;
  top: 0;
  left: ${theme.space[3]}px;
  background-image: url(https://assets.hackclub.com/flag-orpheus-top.svg);
  background-repeat: no-repeat;
  background-position: top left;
  background-size: contain;
  cursor: pointer;
  flex-shrink: 0;
  width: 112px;
  height: 48px;
  @media (min-width: ${theme.breakpoints[1]}) {
    width: 172px;
    height: 64px;
  }
  @media (prefers-reduced-motion: no-preference) {
    transition: ${3 / 16}s cubic-bezier(0.375, 0, 0.675, 1) transform;
    transform-origin: top left;
    &:hover,
    &:focus {
      animation: ${waveFlag} 0.5s linear infinite alternate;
    }
  }
`

const Flag = props => (
  <Base title="Hack Club" href="https://hackclub.com/" {...props} />
)

export default Flag
