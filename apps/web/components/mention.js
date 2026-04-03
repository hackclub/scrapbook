import { memo, useEffect, useState } from 'react'
import { trim } from 'lodash-es'
import Image from 'next/image'
import Link from 'next/link'

export const StaticMention = memo(
  ({ user = {}, className = '', size = 24, children, ...props }) => (
    <Link
      href={`/${user.username}`}
      className={`mention ${className}`}
      prefetch={false}
      {...props}
    >
        <Image
          src={user.avatar}
          alt={user.username}
          loading="lazy"
          width={size}
          height={size}
          className="mention-avatar"
          unoptimized
          style={{ objectFit: 'cover' }}
        />{' '}
        @{user.username}
        {children}
    </Link>
  )
)

const Mention = memo(({ username }) => {
  const [img, setImg] = useState(null)
  const [hasProfile, setHasProfile] = useState(true)

  useEffect(() => {
    let isMounted = true

    fetch(`/api/profiles/${trim(username)}/`)
      .then(async r => {
        if (!r.ok) {
          throw new Error('Profile not found')
        }

        return r.json()
      })
      .then(profile => {
        if (isMounted) {
          setImg(profile.avatar)
          setHasProfile(true)
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasProfile(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [username])

  if (!hasProfile) {
    return <span className="mention post-text-mention">@{username}</span>
  }

  return (
    <Link href={`/${username}`} className='mention post-text-mention' prefetch={false}>
        {img ? (
          <Image
            src={img}
            alt={username}
            loading="lazy"
            width={24}
            height={24}
            className="mention-avatar post-text-mention-avatar"
            unoptimized
            style={{ objectFit: 'cover' }}
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
