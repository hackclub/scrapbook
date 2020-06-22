import Masonry from 'react-masonry-css'
import Post from '../components/post'
import { trackWindowScroll } from 'react-lazy-load-image-component'

const Posts = ({ posts = [], scrollPosition }) => [
  <Masonry
    key="masonry"
    breakpointCols={{
      default: 4,
      1100: 3,
      700: 2,
      500: 1
    }}
    className="masonry-posts"
    columnClassName="masonry-posts-column"
  >
    {posts.map(post => (
      <Post key={post.id} {...post} scrollPosition={scrollPosition} />
    ))}
  </Masonry>,
  <style jsx global key="masonry-style">{`
    .masonry-posts {
      display: flex;
      width: 100%;
      max-width: 100%;
    }

    .masonry-posts-column {
      background-clip: padding-box;
    }

    .post {
      margin-bottom: 1px;
    }

    @media (min-width: 32em) {
      .masonry-posts {
        padding-right: 24px;
      }

      .masonry-posts-column {
        padding-left: 24px;
      }

      .post {
        border-radius: 12px;
        margin-bottom: 24px;
      }
    }
  `}</style>
]

export default trackWindowScroll(Posts)
