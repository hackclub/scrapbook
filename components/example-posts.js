import Post from './post'

const att = (name, url) => [
  {
    filename: `${name}.jpg`,
    type: 'image/jpg',
    thumbnails: { large: { url } }
  }
]

const ExamplePosts = () => [
  <Post
    key="cambrian"
    text="The Cambrian explosion of life on Earth."
    postedAt="530M yrs ago"
    attachments={att(
      'cambrian',
      'https://scx2.b-cdn.net/gfx/news/hires/2016/proteinlikes.png'
    )}
    profile
    muted
  />,
  <Post
    key="bang"
    text="The Big Bang begins the universe."
    postedAt="13.8B yrs ago"
    attachments={att(
      'bigbang',
      'https://cdn.mos.cms.futurecdn.net/vLq9PC5VDGqgCFXxSUUCaQ-1024-80.jpg'
    )}
    profile
    muted
  />
]

export default ExamplePosts
