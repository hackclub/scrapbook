import Post from './post'

const Posts = ({ posts = [], ...props }) => (
  <article className="posts">
    {posts.map(post => (
      <Post key={post.id} {...props} {...post} />
    ))}
  </article>
)

export default Posts
