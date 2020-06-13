import { formatDate } from '../lib/dates'
import { filter } from 'lodash'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Link from 'next/link'

const avatars = {
  msw: 'max',
  zrl: 'zach',
  lachlanjc: 'lachlan',
  melody: 'orpheus'
}

const Post = ({
  profile = false,
  username,
  streakDisplay,
  streakCount,
  text,
  attachments = [],
  postedAt
}) => (
    <section className="post">
      <Link href="/[profile]" as={`/${username}`}>
        <a className="post-header">
          {!profile && (
            <>
              <img
                src={`https://hackclub.com/team/${avatars[username] ||
                  username}.jpg`}
                width={48}
                alt={username}
                className="post-header-avatar"
              />
              <strong className="post-header-name">
                @{username}
                {streakDisplay && (
                  <span className="badge post-header-streak">{streakCount}</span>
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
          {filter(attachments, a => a?.type?.toString().startsWith('image')).map(img => (
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
          ))}
          {filter(attachments, a => a?.type?.startsWith('video')).map(vid => (
            <video
              controls
              key={vid.filename}
              alt={vid.filename}
              src={vid.url}
              onMouseOver={event => event.target.play()}
              onMouseOut={event => event.target.pause()}
              className="post-attachment"
            />
          ))}
        </div>
      )}
    </section>
  )

export default Post
