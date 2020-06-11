import {
  Avatar,
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  IconButton,
} from 'theme-ui'
import Link from 'next/link'
import Icon from '../components/icon'
import Posts from '../components/posts'

const avatars = {
  msw: 'max',
  zrl: 'zach',
  lachlanjc: 'lachlan',
  melody: 'orpheus'
}

export default ({ profile, posts }) => (
  <Container sx={{ py: [4, 5] }}>
    <Box as="header" sx={{ textAlign: 'center', mb: [3, 4] }}>
      <Link href="/" passHref>
        <IconButton
          as="a"
          sx={{
            color: 'muted',
            borderRadius: 'circle',
            display: 'inline-flex',
            width: 'auto',
            pr: 2,
            mb: 2,
            textDecoration: 'none',
            transition: 'box-shadow .125s ease-in-out',
            ':hover,:focus': {
              boxShadow: '0 0 0 2px',
              outline: 'none'
            },
            svg: { mr: 2 }
          }}
        >
          <Icon glyph="view-back" size={24} />
          All updates
        </IconButton>
      </Link>
      <Flex sx={{ mt: 3, justifyContent: 'center', alignItems: 'center' }}>
        <Avatar
          src={`https://hackclub.com/team/${avatars[profile.username] ||
            profile.username}.jpg`}
          size={64}
          mr={3}
          alt={profile.username}
        />
        <Heading as="h1" variant="title" my={0}>
          {profile.username}
        </Heading>
        {profile.streakDisplay && <Badge ml={3} sx={{
          bg: 'cyan',
          fontSize: 2,
          px: 3,
          borderRadius: 'circle',
          verticalAlign: 'middle',
          textAlign: 'center'
        }}>{profile.streakCount} day{profile.streakCount !== 1 ? 's' : ''}</Badge>}
      </Flex>
    </Box>
    <Posts posts={posts} profile />
  </Container>
)

export const getStaticPaths = async () => {
  const { getUsernames } = require('./api/usernames')
  const usernames = await getUsernames()
  const paths = usernames.map(username => ({ params: { username } }))
  return { paths, fallback: false }
}

export const getStaticProps = async ({ params }) => {
  const { getProfile, getPosts } = require('./api/[username]')
  const profile = await getProfile(params.username)
  const posts = await getPosts(profile) || []
  return { props: { profile, posts }, unstable_revalidate: 2 }
}
