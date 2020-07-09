import { memo, useState, useEffect } from 'react'

const HOST = 'https://summer-streaks-git-hc-53-emoji.hackclub.dev'
/*
  process.env.NODE_ENV === 'development'
    ? ''
    : 'https://scrapbook.hackclub.com'
    */

const CustomEmoji = memo(({ name }) => {
  let [image, setImage] = useState()
  useEffect(() => {
    try {
      fetch(HOST + '/api/emoji')
        .then(r => r.json())
        .then(emojis => {
          if (emojis[name.replaceAll(':', '')]) {
            setImage(emojis[name.replaceAll(':', '')])
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
      alt={name + ' emoji'}
      src={image}
      loading="lazy"
      width={18}
      height={18}
    />
  )
})

export default CustomEmoji
