import { memo } from 'react'
import { stripColons } from '../lib/emoji'
import Image from 'next/image'

export const EmojiImg = ({
  name,
  src,
  char,
  height = 18,
  width = height,
  ...props
}) => {
  // If we have a character (Unicode emoji), render it directly
  if (char) {
    return (
      <span
        style={{
          fontSize: `${height}px`,
          verticalAlign: 'middle',
          display: 'inline-block',
          lineHeight: 1
        }}
        className="post-emoji-unicode"
      >
        {char}
      </span>
    )
  }

  // If we have a URL, render as image
  if (src) {
    const isGif = /\.gif($|\?)/i.test(src)

    return (
      <span
        style={{
          height: `${height}px`,
          width: `${width}px`,
          verticalAlign: 'middle',
          display: 'inline-flex',
          lineHeight: 1
        }}
      >
        <Image
          alt={name + ' emoji'}
          loading="lazy"
          className="post-emoji"
          width={width}
          height={height}
          sizes={`${width}px`}
          src={src}
          unoptimized={isGif}
          {...props}
        />
      </span>
    )
  }

  // Fallback: render the name as text
  return (
      <span
        style={{
        fontSize: `${height}px`,
        verticalAlign: 'middle',
        display: 'inline-block',
        lineHeight: 1
      }}
      className="post-emoji-fallback"
    >
      :{stripColons(name)}:
    </span>
  )
}

const CustomEmoji = memo(({ url, char, name }) => {
  const emoji = stripColons(name)
  return <EmojiImg src={url} char={char} name={emoji} />;
})

export default CustomEmoji
