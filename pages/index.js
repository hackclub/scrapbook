import { Container, Heading } from 'theme-ui'
import Posts from '../components/posts'

export default ({ posts }) => (
  <Container sx={{ py: [4, 5] }}>
    <Heading as="h1" variant="title" sx={{ textAlign: 'center', mb: 4 }}>
      Summer Updates
    </Heading>
    <Posts posts={posts} />
  </Container>
)

export const getStaticProps = async () => {
  const { getPosts } = require('./api/posts')
  const posts = await getPosts()
  return { props: { posts }, unstable_revalidate: 2 }
}
