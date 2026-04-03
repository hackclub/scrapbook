import { convertTimestampToDate } from '../lib/dates'
import { filter } from 'lodash-es'
import Icon from '@hackclub/icons'
import Link from 'next/link'
import Content from './content'
import Video from './video'
import Image from 'next/image'
import Reaction from './reaction'

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

function getAttachmentSizes({ profile, visualCount }) {
  if (profile) {
    return visualCount === 1
      ? '(min-width: 64em) 680px, calc(100vw - 48px)'
      : '(min-width: 64em) 340px, calc(50vw - 32px)'
  }

  return visualCount === 1
    ? '(min-width: 64em) 31vw, (min-width: 40em) 46vw, calc(100vw - 48px)'
    : '(min-width: 64em) 15vw, (min-width: 40em) 23vw, calc(50vw - 24px)'
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
  const imageAttachments = filter(attachments, attachment =>
    endsWithAny(imageFileTypes, attachment)
  )
  const audioAttachments = filter(attachments, attachment =>
    endsWithAny(audioFileTypes, attachment)
  )
  const visualCount = imageAttachments.length + mux.length
  const attachmentSizes = getAttachmentSizes({ profile, visualCount })

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
              suppressHydrationWarning
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
                  unoptimized
                  style={{ objectFit: 'cover' }}
                  {...(user.avatar.endsWith(".gif") ? { unoptimized: true } : {})}
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
                <time
                  className="post-header-date"
                  dateTime={postedAt}
                  suppressHydrationWarning
                >
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
            {imageAttachments.map(img => (
                <a
                  key={img}
                  href={img}
                  target="_blank"
                  rel="noreferrer"
                  title={img}
                  className="post-attachment"
                >
                  <Image
                    alt={img}
                    src={img}
                    loading="lazy"
                    title={img}
                    width={400}
                    height={300}
                    sizes={attachmentSizes}
                    style={{ width: '100%', height: 'auto' }}
                    {...(img.endsWith('.gif') ? { unoptimized: true } : {})}
                  />
                </a>
              ))}
            {audioAttachments.map(aud => (
                <audio
                  key={aud}
                  className="post-attachment"
                  src={aud}
                  controls
                  preload="metadata"
                />
              ))}
            {mux.map(id => (
              <Video key={id} mux={id} />
            ))}
          </div>
        )}
        <section className="post-reactions" aria-label="Emoji reactions">
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
            <button
              type="button"
              className="post-reaction"
              aria-label="Add reaction"
              onClick={() => openEmojiPicker(id)}
            >
              +
            </button>
          )}
        </section>
      </section>
    </>
  )
}

export default Post
