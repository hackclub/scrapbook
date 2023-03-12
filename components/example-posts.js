import Post from './post'

let posts = [
  <Post
    key="cambrian"
    text="The Cambrian explosion of life on Earth."
    postedAt="530M yrs ago"
    attachments={['https://cloud-lp0r5yk68.vercel.app/proteinlikes.png']}
    profile
    muted={0.625}
  />,
  <Post
    key="bang"
    text="The Big Bang begins the universe."
    postedAt="13.8B yrs ago"
    attachments={[
      'https://cloud-lp0r5yk68.vercel.app/vlq9pc5vdgqgcfxxsuucaq-1024-80.jpg'
    ]}
    profile
    muted={0.375}
  />
]

const ExamplePosts = (club = false) => {
  return club.club == true
    ? [
        <Post
          key="club"
          text="Your club's adventure beings."
          postedAt="Today"
          attachments={[
            'https://cloud-frsxs88gv-hack-club-bot.vercel.app/0frame_1__3_.png'
          ]}
          profile
          muted={0.8}
        />,
        ...posts
      ]
    : posts
}

export default ExamplePosts
