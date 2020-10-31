import Post from './post'

const att = (name, url, width, height) => [
  {
    filename: `${name}.jpg`,
    type: 'image/jpg',
    thumbnails: { large: { url, width, height } }
  }
]

const ExamplePosts = () => [
  <Post
    key="cambrian"
    text="The Cambrian explosion of life on Earth."
    postedAt="530M yrs ago"
    attachments={att(
      'cambrian',
      'https://cloud-lp0r5yk68.vercel.app/proteinlikes.png',
      465,
      234
    )}
    profile
    muted={0.625}
  />,
  <Post
    key="bang"
    text="The Big Bang begins the universe."
    postedAt="13.8B yrs ago"
    attachments={att(
      'bigbang',
      'https://cloud-lp0r5yk68.vercel.app/vlq9pc5vdgqgcfxxsuucaq-1024-80.jpg',
      600,
      359
    )}
    profile
    muted={0.375}
  />
]

export default ExamplePosts
