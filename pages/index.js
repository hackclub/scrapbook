import { Container, Heading, Grid } from 'theme-ui'
import { find, reverse, orderBy } from 'lodash'
import Post from '../components/post'

export default ({ posts }) => (
  <Container sx={{ py: [4, 5] }}>
    <Heading as="h1" variant="title" sx={{ textAlign: 'center', mb: 4 }}>
      Summer Updates
    </Heading>
    <Grid columns={[null, 2, 3]} gap={[3, 4]} sx={{ alignItems: 'start' }}>
      {posts.map(post => (
        <Post key={post.id} {...post} />
      ))}
    </Grid>
  </Container>
)

export const getStaticProps = async () => {
  const usernames = await fetch(
    'https://api2.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Slack%20Accounts'
  ).then(r => r.json())

  const updates = await fetch(
    'https://api2.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Updates'
  )
    .then(r => r.json())
    .then(updates =>
      updates.map(u => {
        u.user = find(usernames, { id: u.fields['Slack Account']?.[0] }) || {}
        return u
      })
    )
  const posts = reverse(
    orderBy(
      updates.map(({ id, user, fields }) => ({
        id,
        username: user?.fields['Username'],
        streakDisplay: user?.fields['Display Streak'] || false,
        streakCount: user?.fields['Streak Count'] || 1,
        postedAt: fields['Post Time'] || '',
        text: fields['Text'] || '',
        attachments: fields['Attachments'] || []
      })),
      'postedAt'
    )
  )

  return { props: { posts }, unstable_revalidate: 2 }
}
