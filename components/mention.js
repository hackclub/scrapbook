import { memo, useState, useEffect } from 'react'
import { trim } from 'lodash'
import Image from 'next/image'
import Link from 'next/link'

export const StaticMention = memo(
  ({ user = {}, className = '', children, ...props }) => (
    <Link href="/[username]" as={`/${user.username}`}>
      <a className={`mention ${className}`} {...props}>
        <Image
          src={user.avatar}
          alt={user.username}
          loading="lazy"
          width={24}
          height={24}
          className="mention-avatar"
        />
        @{user.username}
        {children}
      </a>
    </Link>
  )
)

const Mention = memo(({ username }) => {
  const [img, setImg] = useState(null)
  useEffect(() => {
    try {
      fetch(`/api/profiles/${trim(username)}/`)
        .then(r => r.json())
        .then(profile => setImg(profile.avatar))
    } catch (e) {}
  }, [])
  return (
    <Link href="/[username]" as={`/${username}`}>
      <a className="mention post-text-mention">
        {img && (
          <Image
            src={img}
            alt={username}
            loading="lazy"
            width={24}
            height={24}
            className="mention-avatar post-text-mention-avatar"
          />
        )}
        @{username}
      </a>
    </Link>
  )
})

export default Mention
