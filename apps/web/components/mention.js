import { memo, useEffect, useState } from 'react'
import { trim } from 'lodash-es'
import Image from 'next/image'
import Link from 'next/link'

export const StaticMention = memo(
  ({ user = {}, className = '', size = 24, children, ...props }) => (
    <Link href={`/${user.username}`} className={`mention ${className}`} {...props}>
        <Image
          src={user.avatar}
          alt={user.username}
          loading="lazy"
          width={size}
          height={size}
          className="mention-avatar"
        />{' '}
        @{user.username}
        {children}
    </Link>
  )
)

const Mention = memo(({ username }) => {
  const [img, setImg] = useState(null)

  useEffect(() => {
    let isMounted = true

    fetch(`/api/profiles/${trim(username)}/`)
      .then(r => r.json())
      .then(profile => {
        if (isMounted) {
          setImg(profile.avatar)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [username])

  return (
    <Link href={`/${username}`} className='mention post-text-mention'>
        {img ? (
          <Image
            src={img}
            alt={username}
            loading="lazy"
            width={24}
            height={24}
            className="mention-avatar post-text-mention-avatar"
            {...(img.endsWith(".gif") ? { unoptimized: true } : {})}
          />
        ) : (
          <span className="mention-avatar post-text-mention-avatar" aria-hidden />
        )}
        @{username}
    </Link>
  )
})

export default Mention
