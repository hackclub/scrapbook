import { memo, useState, useEffect } from 'react'
import Link from 'next/link'

const Mention = memo(({ username }) => {
  const [img, setImg] = useState(null)
  useEffect(() => {
    try {
      fetch(`/api/profiles/${username}/}`)
        .then(r => r.json())
        .then(profile => setImg(profile.avatar))
    } catch (e) {}
  }, [])
  return (
    <Link href="/[username]" as={`/${username}`}>
      <a className="post-text-mention">
        {img && (
          <img
            src={img}
            alt={username}
            width={24}
            className="post-text-mention-avatar"
          />
        )}
        @{username}
      </a>
    </Link>
  )
})

export default Mention
