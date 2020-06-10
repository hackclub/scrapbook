import { Box, Container, Link as A, Flex, Button } from 'theme-ui'
import Flag from './flag'

const NavLink = ({ to }) => (
  <A
    sx={{
      display: ['none', 'inline-block'],
      fontSize: 1,
      textDecoration: 'none',
      mr: [3, 4],
      color: 'black',
      transition: '.125s color ease-in-out',
      ':hover,:focus': { color: 'orange' }
    }}
    href={`#${to.toLowerCase()}`}
    onClick={() => {
      document
        .querySelector(`#${to.toLowerCase()}`)
        .scrollIntoView({ top: 72, behavior: 'smooth' })
    }}
  >
    {to}
  </A>
)

export default () => {
  return (
    <Box
      as="header"
      variant="cards.translucent"
      sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 4 }}
    >
      <Container sx={{ display: 'flex', alignItems: 'center' }}>
        <Flag />
        <Flex as="nav" sx={{ ml: 'auto', py: 2, alignItems: 'center' }}>
          <NavLink to="Hardware" />
          {/* <NavLink to="Mentorship" /> */}
          <NavLink to="Slack" />
          <NavLink to="About" />
          <Button as="a" href="#register" bg="orange">
            Pre-register
          </Button>
        </Flex>
      </Container>
    </Box>
  )
}
