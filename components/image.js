import { useEffect, useState } from 'react'
import useNativeLazyLoading from '@charlietango/use-native-lazy-loading'
import { useInView } from 'react-intersection-observer'

const Image = ({
  width,
  height,
  src,
  placeholderSrc,
  className = 'img',
  ...rest
}) => {
  const [loading, setLoading] = useState(true)
  const supportsLazyLoading = useNativeLazyLoading()
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: '220px 0px'
  })
  const ready = inView || supportsLazyLoading

  useEffect(() => {
    // Setting loaded to true once, when it appears in the viewport
    if (ready) {
      setLoading(false)
    }
  }, [ready])

  return (
    <img
      {...rest}
      ref={!supportsLazyLoading ? ref : undefined}
      src={loading && placeholderSrc ? placeholderSrc : src}
      className={className + (loading ? ' is-loading' : '')}
      width={width}
      height={height}
      loading="lazy"
    />
  )
}

export default Image
