import React, { useState, useEffect } from 'react'

const placeHolder =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII='

const LazyImage = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(placeHolder)
  const [imageRef, setImageRef] = useState()

  const onLoad = event => {
    event.target.classList.add('loaded')
  }

  const onError = event => {
    event.target.classList.add('has-error')
  }

  useEffect(() => {
    let observer
    let didCancel = false

    if (imageRef && imageSrc !== src) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (
                !didCancel &&
                (entry.intersectionRatio > 0 || entry.isIntersecting)
              ) {
                setImageSrc(src)
                observer.unobserve(imageRef)
              }
            })
          },
          {
            threshold: 0.01,
            rootMargin: '75%'
          }
        )
        observer.observe(imageRef)
      } else {
        // Old browsers fallback
        setImageSrc(src)
      }
    }
    return () => {
      didCancel = true
      // on component cleanup, we remove the listner
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef)
      }
    }
  }, [src, imageSrc, imageRef])
  return (
    <>
      <img
        ref={setImageRef}
        src={imageSrc}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
      />
      <style jsx>{`
        @keyframes loaded {
          0% {
            opacity: 0.1;
          }
          100% {
            opacity: 1;
          }
        }
        img {
          display: block;
        }
        img.loaded:not(.has-error) {
          animation: loaded 300ms ease-in-out;
        }
        img.has-error {
          // fallback to placeholder image on error
          content: url(${placeHolder});
        }
      `}</style>
    </>
  )
}

export default LazyImage
