import { memo, useState, useEffect } from 'react'
import { trim } from 'lodash'
import Image from 'next/image'
import Link from 'next/link'
import Icon from '@hackclub/icons'

export const StaticMention = memo<{
  user: any
  className: string
  title: string
  mutual: boolean
  size: number
  key: string
}>(({ user = {}, className = '', size = 24, mutual, ...props }) => (
  <Link href={`/${user.username}`}>
    <a className={`mention ${className}`} {...props}>
      <Image
        src={user.avatar}
        alt={user.username}
        loading="lazy"
        width={size}
        height={size}
        className="mention-avatar"
      />{' '}
      @{user.username}
      {mutual && <Icon glyph="everything" size={24} />}
    </a>
  </Link>
))

const Mention = memo<{ username: string }>(({ username }) => {
  const [img, setImg] = useState(null)
  useEffect(() => {
    try {
      fetch(`/api/profiles/${trim(username)}/`)
        .then(r => r.json())
        .then(profile => setImg(profile.avatar))
    } catch (e) {}
  }, [])
  return (
    <Link href={`/${username}`}>
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
