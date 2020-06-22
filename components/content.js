// Credit to https://blog.rstankov.com/building-auto-link-component-in-react/
import { memo } from 'react'
import { last } from 'lodash'

export const mapLinks = (text, fn) =>
  text.split(/(<.+?\|?\S+>)/).map((chunk, i) => {
    if (chunk.startsWith('<')) {
      const parts = chunk.match(/<((.+)\|)?(\S+)>/)
      const url = parts?.[2] || last(parts)
      const children = last(parts)
        ?.replace(/https?:\/\//, '')
        .replace(/\/$/, '')
      return fn(url, children, i)
    }
    return chunk
  })

const Content = memo(({ children }) => (
  <p className="post-text">
    {mapLinks(children, (url, children, i) => (
      <a href={url} target="_blank" key={i}>
        {children}
      </a>
    ))}
  </p>
))

export default Content
