import {
  Avatar,
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  IconButton
} from 'theme-ui'
import Link from 'next/link'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import Icon from '../components/icon'
import Posts from '../components/posts'

const avatars = {
  msw: 'max',
  zrl: 'zach',
  lachlanjc: 'lachlan',
  melody: 'orpheus'
}
const avatarUrl = u => `https://hackclub.com/team/${avatars[u] || u}.jpg`

export default ({ profile, posts }) => (
  <Container as="main" sx={{ py: [4, 5] }}>
    <Meta
      as={Head}
      name="Summer Streaks"
      title={`@${profile.username}`}
      description={`Follow @${profile.username}’s progress ${profile.streakDisplay ? `(currently a ${profile.streakCount}-day streak!)` : ''} making things in the Hack Club community this summer.`}
      image={`https://workshop-cards.hackclub.com/@${
        profile.username
        }.png?brand=Streaks&images=${avatarUrl(profile.username)}${
        profile.streakDisplay ? `&caption=${profile.streakCount}-day streak` : ''
        }`}
    />
    {profile.css && <link rel="stylesheet" type="text/css" href={`/api/css?url=${profile.css}`} />}
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
          src={avatarUrl(profile.username)}
          size={64}
          mr={3}
          alt={profile.username}
        />
        <Heading as="h1" variant="title" my={0}>
          {profile.username}
        </Heading>
        {profile.streakDisplay && (
          <Badge
            ml={3}
            sx={{
              bg: 'cyan',
              fontSize: 2,
              px: 3,
              borderRadius: 'circle',
              verticalAlign: 'middle',
              textAlign: 'center'
            }}
          >
            {profile.streakCount} day
            {profile.streakCount !== 1 ? 's' : ''}
          </Badge>
        )}
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
  const { getProfile, getPosts } = require('./api/users/[username]')
  const profile = await getProfile(params.username)
  const posts = (await getPosts(profile)) || []
  return { props: { profile, posts }, unstable_revalidate: 2 }
}
