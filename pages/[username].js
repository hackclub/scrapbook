import {
  Avatar,
  Badge,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  IconButton
} from 'theme-ui'
import Link from 'next/link'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import CalendarHeatmap from 'react-calendar-heatmap'
import Icon from '../components/icon'
import Posts from '../components/posts'

const avatars = {
  msw: 'max',
  zrl: 'zach',
  lachlanjc: 'lachlan',
  melody: 'orpheus'
}
const avatarUrl = u => `https://hackclub.com/team/${avatars[u] || u}.jpg`

export default ({ profile, heatmap, posts }) => (
  <Container as="main" sx={{ py: [4, 5] }}>
    <Meta
      as={Head}
      name="Summer Streaks"
      title={`@${profile.username}`}
      description={`Follow @${profile.username}’s progress ${
        profile.streakDisplay
          ? `(currently a ${profile.streakCount}-day streak!)`
          : ''
      } making things in the Hack Club community this summer.`}
      image={`https://workshop-cards.hackclub.com/@${
        profile.username
      }.png?brand=Streaks&images=${avatarUrl(profile.username)}${
        profile.streakDisplay
          ? `&caption=${profile.streakCount}-day streak`
          : ''
      }`}
    />
    {profile.css && (
      <link
        rel="stylesheet"
        type="text/css"
        href={`/api/css?url=${profile.css}`}
      />
    )}
    <Grid
      columns={[null, '2fr 3fr']}
      as="header"
      mb={[3, 4]}
      sx={{ maxWidth: 'copy' }}
    >
      <Box>
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
        <Flex sx={{ mt: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar
            src={avatarUrl(profile.username)}
            size={64}
            mr={3}
            alt={profile.username}
          />
          <Heading as="h1" variant="title" sx={{ my: 0, flex: '1 1 auto' }}>
            {profile.username}
          </Heading>
        </Flex>
        {profile.streakDisplay && (
          <Badge
            sx={{
              mt: 3,
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
      </Box>
      <Container
        as="section"
        variant="narrow"
        mt={3}
        aria-hidden
        sx={{
          maxHeight: 266,
          overflowY: 'hidden',
          svg: { maxWidth: '100%' },
          '.react-calendar-heatmap text': { fill: 'muted', fontSize: '6px' },
          '.react-calendar-heatmap .color-empty': { fill: 'sheet' },
          '.react-calendar-heatmap .color-1': { fill: 'one' },
          '.react-calendar-heatmap .color-2': { fill: 'two' },
          '.react-calendar-heatmap .color-3': { fill: 'three' },
          '.react-calendar-heatmap .color-4': { fill: 'four' }
        }}
      >
        <CalendarHeatmap
          startDate={new Date('2020-06-09')}
          endDate={new Date('2020-08-09')}
          values={heatmap}
          showWeekdayLabels
          classForValue={val => (val ? `color-${val.count}` : 'color-empty')}
          titleForValue={v => v?.date}
          viewBox="0 0 128 92"
        />
      </Container>
    </Grid>
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
  const posts = await getPosts(profile)

  const { groupBy } = require('lodash')
  const days = groupBy(posts, p => p.postedAt?.substring(0, 10))
  const heatmap = Object.keys(days).map(date => ({
    date,
    count: days[date].length || 0
  }))

  return { props: { profile, heatmap, posts }, unstable_revalidate: 2 }
}
