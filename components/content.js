// Credit to https://blog.rstankov.com/building-auto-link-component-in-react/
import { memo } from 'react'
import { last } from 'lodash'
import Mention from './mention'
import { toArray } from 'react-emoji-render'

const parseEmojis = (value) => {
  const emojisArray = toArray(value)

  const parsedString = emojisArray.reduce((previous, current) => {
    if (typeof current === 'string') {
      return previous + current
    } else {
      return previous + current.props.children
    }
  }, '')

  return parsedString
}

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
      parseEmojis(children),
      (url, children, i) => (
        <a href={url} target="_blank" key={i}>
          {children}
        </a>
      ),
      (username, i) => (
        <Mention username={username} key={username + i} />
      )
    )}
  </p>
))

export default Content
