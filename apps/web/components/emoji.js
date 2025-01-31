import { memo, useState, useEffect } from 'react'
import { stripColons } from '../lib/emoji'
import Image from 'next/image'

export const EmojiImg = ({ name, ...props }) => (
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
      {...props}
      unoptimized
    />
  </div>
)

const CustomEmoji = memo(({ url, name }) => {
  const emoji = stripColons(name)
  return <EmojiImg src={url} name={emoji} />;
})

export default CustomEmoji
