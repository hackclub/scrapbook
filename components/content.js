// Credit to https://blog.rstankov.com/building-auto-link-component-in-react/
import { Fragment, memo } from 'react'
import { last } from 'lodash'
import Mention from './mention'
import Emoji from './emoji'

const dataDetector = /(<.+?\|?\S+>)|(@\S+)|(`{3}[\S\s]+`{3})|(`[^`]+`)|(_[^_]+_)|(\*[^\*]+\*)|(:.+?\|?\S+:)/

export const formatText = text =>
  text.split(dataDetector).map((chunk, i) => {
    if (chunk?.startsWith(':')) {
      return <Emoji name={chunk} key={i} />
    }
    if (chunk?.startsWith('@') || chunk?.startsWith('<@')) {
      const username = chunk.replace(/[@<>]/g, '')
      return <Mention username={username} key={username + i} />
    }
    if (chunk?.startsWith('<')) {
      const parts = chunk.match(/<(([^\|]+)\|)?(.+?)>/)
      const url = parts?.[2] || last(parts)
      const children = last(parts)
        ?.replace(/https?:\/\//, '')
        .replace(/\/$/, '')
      return (
        <a href={url} target="_blank" key={i}>
          {children}
        </a>
      )
    }
    if (chunk?.startsWith('```')) {
      return <pre key={i}>{chunk.replace(/```/g, '')}</pre>
    }
    if (chunk?.startsWith('`')) {
      return <code key={i}>{chunk.replace(/`/g, '')}</code>
    }
    if (chunk?.startsWith('*')) {
      return <strong key={i}>{chunk.replace(/\*/g, '')}</strong>
    }
    if (chunk?.startsWith('_')) {
      return <i key={i}>{chunk.replace(/_/g, '')}</i>
    }
    return <Fragment key={i}>{chunk?.replace(/&amp;/g, '&')}</Fragment>
  })

const Content = memo(({ children }) => (
  <article className="post-text">{formatText(children)}</article>
))

export default Content
