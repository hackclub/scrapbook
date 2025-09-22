import { memo, useState, useEffect } from 'react'
import { stripColons } from '../lib/emoji'
import Image from 'next/image'

export const EmojiImg = ({ name, src, char, ...props }) => {
  // If we have a character (Unicode emoji), render it directly
  if (char) {
    return (
      <span
        style={{
          fontSize: props.height ? `${props.height}px` : '18px',
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
    return (
      <div
        style={{
          height: !props.height ? '18px' : `${props.height}px`,
          verticalAlign: 'middle'
        }}
      >
        <Image
          alt={name + ' emoji'}
          loading="lazy"
          className="post-emoji"
          width={18}
          height={18}
          src={src}
          {...props}
          unoptimized
        />
      </div>
    )
  }

  // Fallback: render the name as text
  return (
    <span
      style={{
        fontSize: props.height ? `${props.height}px` : '18px',
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