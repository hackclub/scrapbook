import Link from 'next/link'
import { EmojiImg } from './emoji'
import { startCase } from 'lodash'
import toast from 'react-hot-toast'
import { mutate } from 'swr'

async function clickEmoji(name, postID, swrKey) {
  toast
    .promise(
      fetch(`/api/web/reactions/click?emojiName=${name}&post=${postID}`),
      {
        loading: 'Clicking...',
        success: 'Success!',
        error: 'An unexpected error occured - please try again.'
      }
    )
    .then(() => {
      if (swrKey) {
        mutate(swrKey)
      }
    })
}

const Reaction = ({
  name,
  char,
  url,
  postID,
  authStatus,
  usersReacted,
  authSession,
  swrKey
}) => {
  let children = (
    <>
      {url && (
        <EmojiImg
          src={url}
          name={name}
          width={24}
          height={24}
        />
      )}
      <span style={{ transform: 'translateY(2px)' }}>{char}</span>
    </>
  )
  return authStatus == 'authenticated' ? (
    <span
      className={`post-reaction ${
        usersReacted.includes(authSession.user.id) ? 'post-reaction-active' : ''
      }`}
      title={startCase(name)}
      onClick={() => clickEmoji(name, postID, swrKey)}
    >
      {children}
    </span>
  ) : (
    <Link href={`/r/${name}`} legacyBehavior className='post-reaction' title={startCase(name)}>
        {children}
    </Link>
  )
}

export default Reaction
