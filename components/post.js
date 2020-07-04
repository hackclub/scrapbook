import { convertTimestampToDate } from '../lib/dates'
import { filter } from 'lodash'
import { SimpleImg } from 'react-simple-img'
import Icon from '@hackclub/icons'
import Link from 'next/link'
import Content from './content'
import Video from './video'
import LazyImage from './lazy-image'

const PostImg = ({ img }) => {
  const lg = img.thumbnails?.large || {}
  const isPortrait = lg?.height > lg?.width
  const aspectRatio = isPortrait
    ? lg?.height / lg?.width
    : lg?.width / lg?.height
  return (
    <a
      href={img.thumbnails?.full?.url || img.url}
      target="_blank"
      className="post-attachment"
    >
      <LazyImage
        alt={img.filename}
        src={img.thumbnails?.large?.url || img.url}
        width={img.thumbnails?.large?.width}
        height={img.thumbnails?.large?.height}
      />
    </a>
  )
}

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
  scrollPosition,
  muted = false
}) => (
  <section
    className="post"
    id={id}
    style={muted ? { opacity: muted, pointerEvents: 'none' } : null}
  >
    <Link href="/[profile]" as={`/${user.username}`}>
      <a className="post-header">
        {profile ? (
          <time className="post-header-date" dateTime={postedAt}>
            {postedAt?.startsWith('20')
              ? convertTimestampToDate(postedAt)
              : postedAt}
          </time>
        ) : (
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
            <div className="post-header-container">
              <span className="post-header-name">
                <strong>@{user.username}</strong>
                <span
                  className={`badge post-header-streak ${
                    user.streakCount === 0 ? 'header-streak-zero' : ''
                  }`}
                  title={`${user.streakCount}-day streak`}
                >
                  {`${user.streakCount <= 7 ? user.streakCount : '7+'}`}
                  <Icon size={24} glyph="admin-badge" title="Streak icon" />
                </span>
                {user.css && (
                  <Icon
                    size={24}
                    glyph="rep"
                    title="Has a customized profile"
                    className="post-header-css"
                  />
                )}
              </span>
              <time className="post-header-date" dateTime={postedAt}>
                {postedAt?.startsWith('20')
                  ? convertTimestampToDate(postedAt)
                  : postedAt}
              </time>
            </div>
          </>
        )}
      </a>
    </Link>
    <Content>{text}</Content>
    {attachments.length > 0 && (
      <div className="post-attachments">
        {filter(attachments, a => a?.type?.toString().startsWith('image')).map(
          img => (
            <a
              key={img.url}
              href={img.thumbnails?.full?.url || img.url}
              target="_blank"
              className="post-attachment"
            >
              <LazyImage
                alt={img.filename}
                src={img.thumbnails?.large?.url || img.url}
                width={img.thumbnails?.large?.width}
                height={img.thumbnails?.large?.height}
              />
            </a>
          )
        )}
        {filter(attachments, a => a?.type?.toString().startsWith('audio')).map(
          aud => (
            <audio
              key={aud.url}
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
