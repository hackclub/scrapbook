import ReactAudioPlayer from 'react-audio-player'

const AudioPlayer = ({
  url
}) => (
  <ReactAudioPlayer
    src={url}
    autoPlay
    loop
    controls
    preload
  />
)

export default AudioPlayer