// Credit to https://blog.rstankov.com/building-auto-link-component-in-react/
import { memo } from 'react'
import { last } from 'lodash'
import Link from 'next/link'

export const mapLinks = (text, link, mention) =>
  text.split(/(<.+?\|?\S+>)|(@\S+)/).map((chunk, i) => {
    if (chunk?.startsWith('@')) {
      return mention(chunk.replace('@', ''), i)
    }
    if (chunk?.startsWith('<')) {
      const parts = chunk.match(/<((.+)\|)?(\S+)>/)
      const url = parts?.[2] || last(parts)
      const children = last(parts)
        ?.replace(/https?:\/\//, '')
        .replace(/\/$/, '')
      return link(url, children, i)
    }
    return chunk?.replace('&amp;', '&')
  })

const Content = memo(({ children }) => (
  <p className="post-text">
    {mapLinks(
      children,
      (url, children, i) => (
        <a href={url} target="_blank" key={i}>
          {children}
        </a>
      ),
      (username, i) => (
        <Link href="/[username]" as={`/${username}`} key={username + i}>
          <a className="post-text-mention">@{username}</a>
        </Link>
      )
    )}
  </p>
))

export default Content
