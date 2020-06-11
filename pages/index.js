import { Container, Heading } from 'theme-ui'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import Posts from '../components/posts'

export default ({ posts }) => (
  <Container sx={{ py: [4, 5] }}>
    <Meta
      as={Head}
      name="Summer Streaks"
      title="Summer Streaks"
      description="See everything the Hack Club community is making this summer."
      image="https://workshop-cards.hackclub.com/Summer%20Updates.png?brand=Streaks&fontSize=300px"
    />
    <Heading as="h1" variant="title" sx={{ textAlign: 'center', mb: 4 }}>
      Hack&nbsp;Club Summer Updates
    </Heading>
    <Posts posts={posts} />
  </Container>
)

export const getStaticProps = async () => {
  const { getPosts } = require('./api/posts')
  const posts = await getPosts()
  return { props: { posts }, unstable_revalidate: 2 }
}
