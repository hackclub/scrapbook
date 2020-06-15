import { formatDate } from '../lib/dates'
import { filter } from 'lodash'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Link from 'next/link'
import Video from './video'

const Post = ({
  profile = false,
  user = {
    username: 'abc',
    avatar: '',
    streakDisplay: false,
    streakCount: 0
  },
  text,
  attachments = [],
  mux = [],
  postedAt
}) => (
  <section className="post">
    <Link href="/[profile]" as={`/${user.username}`}>
      <a className="post-header">
        {!profile && (
          <>
            {user.avatar && (
              <img
                loading="lazy"
                src={user.avatar}
                width={48}
                alt={user.username}
                className="post-header-avatar"
              />
            )}
            <strong className="post-header-name">
              @{user.username}
              {user.streakDisplay && (
                <span className="badge post-header-streak">
                  {user.streakCount}
                </span>
              )}
            </strong>
          </>
        )}
        <time className="post-header-date" dateTime={postedAt}>
          {formatDate(postedAt)}
        </time>
      </a>
    </Link>
    <p className="post-text">{text}</p>
    {attachments.length > 0 && (
      <div className="post-attachments">
        {filter(attachments, a => a?.type?.toString().startsWith('image')).map(
          img => (
            <a
              key={img.filename}
              href={img.thumbnails?.full?.url}
              target="_blank"
              className="post-attachment"
            >
              <LazyLoadImage
                alt={img.filename}
                effect="blur"
                src={img.thumbnails?.large?.url}
                placeholderSrc={img.thumbnails?.small?.url}
              />
            </a>
          )
        )}
        {mux.map(id => (
          <Video key={id} mux={id} />
        ))}
      </div>
    )}
  </section>
)

export default Post
