import { convertTimestampToDate } from '../lib/dates'
import { filter } from 'lodash'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import Icon from '@hackclub/icons'
import Link from 'next/link'
import Video from './video'

const Post = ({
  id = new Date().toISOString(),
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
  postedAt,
  muted = false
}) => (
  <section
    className="post"
    id={id}
    style={muted ? { opacity: muted, pointerEvents: 'none' } : null}
  >
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
            <strong className="post-header-name">@{user.username}</strong>
            {user.streakDisplay && (
              <span
                className="badge post-header-streak"
                title={`${user.streakCount}-day streak`}
              >
                {user.streakCount}
                <Icon size={24} glyph="admin-badge" title="Streak icon" />
              </span>
            )}
            {user.css && (
              <Icon size={24} glyph="rep" title="Has a customized profile" />
            )}
          </>
        )}
        <time className="post-header-date" dateTime={postedAt}>
          {postedAt?.startsWith('20')
            ? convertTimestampToDate(postedAt)
            : postedAt}
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
        {filter(attachments, a => a?.type?.toString().startsWith('audio')).map(
          aud => (
            <audio
              key={aud.filename}
              className="post-attachment"
              src={aud.url}
              controls
              preload="metadata"
            />
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
