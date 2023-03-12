import Masonry from 'react-masonry-css'
import Post from '../components/post'
import { Close } from '../components/close'
import EmojiPicker from 'emoji-picker-react'
import toast from 'react-hot-toast'
import { mutate } from 'swr'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

const Posts = ({ posts = [], swrKey = null }) => {
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [emojiPickerPostiD, setEmojiPickerPostID] = useState('')
  function openEmojiPicker(postID) {
    setEmojiPickerOpen(true)
    setEmojiPickerPostID(postID)
  }
  async function react(emoji) {
    setEmojiPickerOpen(false)
    toast
      .promise(
        fetch(
          `/api/web/reactions/new?emoji=${emoji.emoji}&emojiName=${emoji.names[0]}&post=${emojiPickerPostiD}`
        ),
        {
          loading: 'Reacting...',
          success: 'Success!',
          error: 'An unexpected error occured - please try again.'
        }
      )
      .then(() => {
        if (swrKey) {
          mutate(swrKey)
        }
      })
  }
  const { data: session, status } = useSession()
  return [
    emojiPickerOpen && (
      <div
        style={{
          position: 'fixed',
          zIndex: 999,
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)'
        }}
      >
        <Close onClick={() => setEmojiPickerOpen(false)} background={true} />
        <EmojiPicker onEmojiClick={react} />
      </div>
    ),
    <Masonry
      key="masonry"
      breakpointCols={{
        10000: 4,
        1024: 3,
        640: 2,
        480: 1,
        default: 1
      }}
      className="masonry-posts"
      columnClassName="masonry-posts-column"
    >
      {posts.map(post => (
        <Post
          key={post.id}
          openEmojiPicker={openEmojiPicker}
          authStatus={status}
          authSession={session}
          swrKey={swrKey}
          {...post}
        />
      ))}
    </Masonry>,
    <style jsx global key="masonry-style">{`
      .masonry-posts {
        display: flex;
        width: 100%;
        max-width: 100%;
      }

      .masonry-posts-column {
        background-clip: padding-box;
      }

      .post {
        margin-bottom: 2px;
      }

      @media (min-width: 32em) {
        .masonry-posts {
          padding-right: 12px;
        }

        .masonry-posts-column {
          padding-left: 12px;
        }

        .post {
          border-radius: 12px;
          margin-bottom: 12px;
        }
      }

      @media (min-width: 64em) {
        .masonry-posts {
          padding-right: 24px;
        }

        .masonry-posts-column {
          padding-left: 24px;
        }

        .post {
          margin-bottom: 24px;
        }
      }
    `}</style>
  ]
}

export default Posts
