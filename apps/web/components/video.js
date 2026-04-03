// Credit to https://github.com/vercel/next.js/blob/canary/examples/with-mux-video/components/video-player.js
import { useCallback, useEffect, useRef } from 'react'

const POSTER_WIDTH = 384
const POSTER_HEIGHT = 216

const Video = ({ mux, ...props }) => {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const hasLoadedRef = useRef(false)
  const src = `https://stream.mux.com/${mux}.m3u8`

  const loadVideo = useCallback(async () => {
    const video = videoRef.current
    if (!video || hasLoadedRef.current) return

    hasLoadedRef.current = true

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== src) {
        video.src = src
      }
      return
    }

    try {
      const { default: Hls } = await import('hls.js')

      if (!Hls.isSupported()) return

      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
      hlsRef.current = hls
    } catch {
      hasLoadedRef.current = false
    }
  }, [src])

  const playPreview = useCallback(async () => {
    await loadVideo()

    try {
      await videoRef.current?.play()
    } catch {}
  }, [loadVideo])

  const pausePreview = useCallback(() => {
    videoRef.current?.pause()
  }, [])

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [])

  return (
    <video
      ref={videoRef}
      className="post-attachment"
      id={mux}
      width={POSTER_WIDTH}
      height={POSTER_HEIGHT}
      controls
      playsInline
      loop
      preload="none"
      style={{ width: '100%', height: 'auto', aspectRatio: '16 / 9' }}
      onPointerDown={loadVideo}
      onTouchStart={loadVideo}
      onMouseEnter={playPreview}
      onMouseLeave={pausePreview}
      onPlay={loadVideo}
      {...props}
    />
  )
}

export default Video
