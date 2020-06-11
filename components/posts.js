import { Grid } from 'theme-ui'
import Post from './post'

const Posts = ({ posts = [], ...props }) => (
  <Grid columns={[null, 2, 3]} gap={[3, 4]} sx={{ alignItems: 'start' }}>
    {posts.map(post => (
      <Post key={post.id} {...props} {...post} />
    ))}
  </Grid>
)

export default Posts
