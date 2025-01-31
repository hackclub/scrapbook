// Credit to https://github.com/vercel/next.js/blob/canary/examples/with-mux-video/components/video-player.js
import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

const Video = ({ mux, ...props }) => {
  const videoRef = useRef(null)
  const src = `https://stream.mux.com/${mux}.m3u8`

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.controls = true
    let hls

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // This will run in safari, where HLS is supported natively
      video.src = src
    } else if (Hls.isSupported()) {
      // This will run in all other modern browsers
      hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
    } else {
      console.error(
        'This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API'
      )
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [src, videoRef])

  return (
    <video
      ref={videoRef}
      poster={`https://image.mux.com/${mux}/thumbnail.jpg?width=512&fit_mode=pad&time=0`}
      className="post-attachment"
      id={mux}
      controls
      playsInline
      loop
      preload="metadata"
      onMouseOver={e => e.target.play()}
      onMouseOut={e => e.target.pause()}
      {...props}
    />
  )
}

export default Video
