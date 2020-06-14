// Credit to https://github.com/devcshort/react-hls/blob/master/src/components/react-hls-player.js
import React, { Component } from 'react'
import Hls from 'hls.js'

class Video extends Component {
  constructor(props) {
    super(props)

    this.state = {
      url: `https://stream.mux.com/${props.mux}.m3u8`
    }

    this.hls = null
    this.video = React.createRef()
  }

  componentDidMount() {
    if (Hls.isSupported()) {
      this._initPlayer()
    }
  }

  componentWillUnmount() {
    if (this.hls) {
      this.hls.destroy()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.url !== this.props.url) {
      this._initPlayer()
    }
  }

  _initPlayer() {
    if (this.hls) this.hls.destroy()

    const { hlsConfig } = this.props
    const hls = new Hls(hlsConfig)

    hls.attachMedia(this.props.ref.current)
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(this.state.url)
    })

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError()
            break
          default:
            this._initPlayer()
            break
        }
      }
    })

    this.hls = hls
  }

  render() {
    const { controls, mux, width, ...props } = this.props
    if (!this.hls) props.src = this.state.url

    return mux ? (
      <video
        ref={this.props.ref}
        className="post-attachment hls-player"
        id={mux}
        controls={controls}
        poster={`https://image.mux.com/${mux}/thumbnail.jpg?width=512&fit_mode=pad&time=0`}
        playsInline
        loop
        preload="metadata"
        onMouseOver={e => e.target.play()}
        onMouseOut={e => e.target.pause()}
        {...props}
      />
    ) : null
  }
}

Video.defaultProps = {
  controls: true,
  // width: 256,
  // height: 192,
  ref: React.createRef()
}

export default Video
