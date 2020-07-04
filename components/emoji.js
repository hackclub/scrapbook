import { memo, useState, useEffect } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'

const Emoji = ({ name }) => {
    let [image, setImage] = useState()
    useEffect(() => {
        try {
            fetch("https://emoji-ranker.now.sh/custompng")
                .then(r => r.json())
                .then(emojis => {
                    if (emojis[name.replaceAll(":", "")]) {
                        setImage(emojis[name.replaceAll(":", "")])
                        return
                    }
                    setImage("https://emoji.slack-edge.com/T0266FRGM/parrot/c9f4fddc5e03d762.gif")
                })
        } catch (e) { alert("POOPIE") }
    }, [])
    return (
        <LazyLoadImage
            alt={name}
            effect="blur"
            src={image}
            height="18px"
            visibleByDefault
        />
    )
}

export default Emoji