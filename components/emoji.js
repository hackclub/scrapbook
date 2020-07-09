import { memo, useState, useEffect } from 'react'

const stripColons = str => {
  const colonIndex = str.indexOf(':')
  if (colonIndex > -1) {
    // :emoji:
    if (colonIndex === str.length - 1) {
      str = str.substring(0, colonIndex)
      return stripColons(str)
    } else {
      str = str.substr(colonIndex + 1)
      return stripColons(str)
    }
  }
  return str
}

const CustomEmoji = memo(({ name }) => {
  const emoji = stripColons(name)
  let [image, setImage] = useState()
  useEffect(() => {
    try {
      fetch('https://scrapbook.hackclub.com/api/emoji')
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
  return (
    <img
      alt={emoji + ' emoji'}
      src={image}
      loading="lazy"
      width={18}
      height={18}
    />
  )
})

export default CustomEmoji
