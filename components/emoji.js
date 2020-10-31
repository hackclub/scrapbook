import { memo, useState, useEffect } from 'react'
import { stripColons } from '../lib/emoji'
import Image from 'next/image'

export const EmojiImg = ({ name, ...props }) => (
  <Image
    alt={name + ' emoji'}
    loading="lazy"
    className="post-emoji"
    width={18}
    height={18}
    {...props}
  />
)

const CustomEmoji = memo(({ name }) => {
  const emoji = stripColons(name)
  let [image, setImage] = useState(null)
  useEffect(() => {
    try {
      fetch('/api/emoji/')
        .then(r => r.json())
        .then(emojis => {
          if (emojis[emoji]) {
            setImage(emojis[emoji])
            return
          }
          setImage(
            'https://emoji.slack-edge.com/T0266FRGM/parrot/c9f4fddc5e03d762.gif'
          )
        })
    } catch (e) {}
  }, [])
  return image ? <EmojiImg src={image} name={emoji} /> : <span>:{emoji}:</span>
})

export default CustomEmoji
