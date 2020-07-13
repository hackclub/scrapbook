import { convertTimestampToDate } from '../lib/dates'
import { filter } from 'lodash'
import Icon from '@hackclub/icons'
import Link from 'next/link'
import Content from './content'
import Video from './video'
import Image from './image'
import Reaction from './reaction'

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
  reactions = [],
  postedAt,
  slackURL,
  muted = false
}) => (
  <section
    className="post"
    id={id}
    style={muted ? { opacity: muted, pointerEvents: 'none' } : null}
  >
    {profile || !user ? (
      <a href={slackURL}>
        <header className="post-header">
          <time className="post-header-date" dateTime={postedAt}>
            {postedAt?.startsWith('20')
              ? convertTimestampToDate(postedAt)
              : postedAt}
          </time>
        </header>
      </a>
    ) : (
      <Link href="/[profile]" as={`/${user.username}`}>
        <a className="post-header">
          {user.avatar && (
            <img
              loading="lazy"
              src={user.avatar}
              width={48}
              height={48}
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
              {user.audio && (
                <Icon
                  size={24}
                  glyph="rss"
                  title="Has a customized sound"
                  className="post-header-audio"
                />
              )}
            </span>
            <time className="post-header-date" dateTime={postedAt}>
              {postedAt?.startsWith('20')
                ? convertTimestampToDate(postedAt)
                : postedAt}
            </time>
          </div>
        </a>
      </Link>
    )}
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
              <Image
                alt={img.filename}
                src={img.thumbnails?.large?.url || img.url}
                placeholderSrc={img.thumbnails?.small?.url || img.url}
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
    {reactions.length > 0 && (
      <footer className="post-reactions" aria-label="Emoji reactions">
        {reactions.map(reaction => (
          <Reaction key={reaction.name} {...reaction} />
        ))}
      </footer>
    )}
  </section>
)

export default Post
