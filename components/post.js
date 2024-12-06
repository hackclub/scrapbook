import { convertTimestampToDate } from '../lib/dates'
import { proxy } from '../lib/images'
import { filter } from 'lodash'
import Icon from '@hackclub/icons'
import Link from 'next/link'
import Content from './content'
import Video from './video'
import Image from 'next/image'
import Reaction from './reaction'
import EmojiPicker from 'emoji-picker-react'

const imageFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']

const audioFileTypes = ['mp3', 'wav', 'aiff', 'm4a']

function endsWithAny(suffixes, string) {
  try {
    return suffixes.some(function (suffix) {
      return string.endsWith(suffix)
    })
  } catch {
    return false
  }
}

const Post = ({
  id = new Date().toISOString(),
  profile = false,
  user = {
    username: 'abc',
    avatar: '',
    displayStreak: false,
    streakCount: 0
  },
  text,
  attachments = [],
  mux = [],
  reactions = [],
  postedAt,
  slackUrl,
  muted = false,
  openEmojiPicker = () => {},
  authStatus,
  swrKey,
  authSession
}) => {
  return (
    <>
      <section
        className="post"
        id={id}
        style={muted ? { opacity: muted, pointerEvents: 'none' } : null}
      >
        {profile || !user ? (
          <header className="post-header">
            <time
              className="post-header-date"
              data-tip
              data-for={`tip-${id}`}
              dateTime={postedAt}
            >
              {postedAt?.startsWith('20')
                ? convertTimestampToDate(postedAt)
                : postedAt}
            </time>
          </header>
        ) : (
          <Link href="/[profile]" as={`/${user.username}`} className='post-header' prefetch={false}>
              {user.avatar && (
                <Image
                  loading="lazy"
                  src={user.avatar}
                  width={48}
                  height={48}
                  alt={user.username}
                  className="post-header-avatar"
                />
              )}
              <section className="post-header-container">
                <span className="post-header-name">
                  <strong>@{user.username}</strong>
                  <span
                    className={`badge post-header-streak ${
                      !user.displayStreak || user.streakCount === 0
                        ? 'header-streak-zero'
                        : ''
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
              </section>
          </Link>
        )}
        <Content>{text}</Content>
        {(attachments.length > 0 || mux.length > 0) && (
          <div className="post-attachments">
            {filter(attachments, a => endsWithAny(imageFileTypes, a)).map(
              img => (
                <a
                  key={img}
                  href={img}
                  target="_blank"
                  title={img}
                  className="post-attachment"
                >
                  <Image 
                    key={img}
                    alt={img}
                    src={img}
                    loading='lazy'
                    title={img}
                    width={400}
                    height={300}
                  />
                </a>
              )
            )}
            {filter(attachments, a => endsWithAny(audioFileTypes, a)).map(
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
        <footer className="post-reactions" aria-label="Emoji reactions">
          {reactions.map(reaction => (
            <Reaction
              key={id + reaction.name}
              {...reaction}
              postID={id}
              authStatus={authStatus}
              authSession={authSession}
              swrKey={swrKey}
            />
          ))}
          {authStatus == 'authenticated' && (
            <div className="post-reaction" onClick={() => openEmojiPicker(id)}>
              +
            </div>
          )}
        </footer>
      </section>
    </>
  )
}

export default Post
