import {
  Avatar,
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  IconButton,
} from 'theme-ui'
import { find, filter, map, reverse, orderBy } from 'lodash'
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
  const usernames = await fetch(
    'https://api2.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Slack%20Accounts'
  )
    .then(r => r.json())
    .then(a => map(a, 'fields.Username'))
  const paths = usernames.map(username => ({ params: { username } }))
  return { paths, fallback: false }
}

export const getStaticProps = async ({ params }) => {
  const { username } = params
  const accounts = await fetch(
    'https://api2.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Slack%20Accounts'
  ).then(r => r.json())
  const user = find(accounts, ['fields.Username', username]) || {}
  const profile = {
    id: user?.id,
    username,
    streakDisplay: user?.fields['Display Streak'] || false,
    streakCount: user?.fields['Streak Count'] || 1
  }

  const allUpdates = await fetch(
    'https://api2.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Updates'
  ).then(r => r.json())
  const updates = filter(allUpdates, ['fields.Slack Account', [user?.id]])
  const posts = reverse(orderBy(updates.map(({ id, fields }) => ({
    ...profile,
    postedAt: fields['Post Time'] || '',
    text: fields['Text'] || '',
    attachments: fields['Attachments'] || []
  })), 'postedAt'))

  return { props: { profile, posts }, unstable_revalidate: 2 }
}
