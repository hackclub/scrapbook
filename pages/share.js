import React, { useState } from 'react'
import Posts from '../components/posts'
import Input from '../components/input'
import { emailToPfp } from '../lib/email'

/*
TODO
- [x] see other scrapbook posts
- [x] see preview of your own scrapbook post
- [ ] clubs dropdown autofill / bring back the dropdown
- [ ] get pfp (figure out implementation)
- [x] page scrolls horizontally (fix padding)
- [x] page scrolls vertically
- [ ] autofill image from url
*/

const submissionSuccessOptions = {
  '': 'Ship it!',
  succeeded: 'Post submitted!',
  failed: 'Post failed!',
  awaiting: 'Shipping post!'
}

export default function Page({ link, initialData }) {
  const [dropping, setDropping] = useState(false)

  const [postData, setPostData] = useState({
    image: '',
    name: '',
    email: '',
    description: '',
    club: '',
    link: link
  })

  const [submissionSuccess, setSubmissionSuccess] = useState('')

  const preview = () => ({
    id: 1,
    user: {
      username: postData.name || 'Fiona Hackwoof',
      avatar: emailToPfp(postData.email) || 'https://placedog.net/500'
    },
    text:
      [postData.description, postData.link].join('\n') || 'feed me (woof woof)',
    attachments: [
      postData.image ||
        'https://lawcall.com/wp-content/uploads/2015/03/Dog-Eating.jpg'
    ],
    postedAt: 'just now'
  })

  const onDragOver = e => {
    preventDefaults(e)
  }

  const onDragEnter = e => {
    preventDefaults(e)
    setDropping(true)
  }

  const onDragLeave = e => {
    preventDefaults(e)
    setDropping(false)
  }

  const preventDefaults = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDrop = e => {
    preventDefaults(e)
    const files = e.dataTransfer.files
    const input = document.querySelector('.image-drop-input')
    input.files = files
    setDropping(false)
    const reader = new FileReader()
    reader.onloadend = function () {
      setPostData({ ...postData, image: reader.result })
    }
    reader.readAsDataURL(files[0])
  }

  const shipIt = async e => {
    setSubmissionSuccess('awaiting')
    const { ok } = await fetch(`/api/share`, {
      method: 'POST',
      body: postData
    }).then(r => r.json())
    setSubmissionSuccess(ok ? 'succeeded' : 'failed')
  }

  const valid = () => Object.values(postData).every(x => x !== '')

  return (
    <div>
      <div className="grid">
        <div>
          <div
            style={{
              textAlign: 'left',
              background: 'var(--colors-elevated)',
              width: 'fit-content',
              marginLeft: '32px',
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            <h1>
              Share your project with your club and the Hack Club community!
            </h1>
            <Input
              label="Full Name"
              id="name"
              type="text"
              value={postData.name}
              onChange={e => setPostData({ ...postData, name: e.target.value })}
            />
            <Input
              label="Email"
              id="email"
              type="email"
              value={postData.email}
              onChange={e =>
                setPostData({ ...postData, email: e.target.value })
              }
            />
            <Input
              label="Club"
              id="club"
              value={postData.club}
              onChange={e => setPostData({ ...postData, club: e.target.value })}
            />
            <Input
              label="Project Link"
              id="project-link"
              type="type"
              value={postData.link}
              onChange={e => setPostData({ ...postData, link: e.target.value })}
            />
            <div className="dropbox">
              <div
                className="image-drop"
                style={{ background: dropping ? '#d4f7d3' : '' }}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
              >
                {postData.image != '' && '☑️ Uploaded!'} Drop
                {postData.image != '' && ' new'} image here.
                <input
                  className="image-drop-input"
                  type="file"
                  id="img"
                  name="img"
                  accept="image/*"
                ></input>
              </div>
            </div>
            <Input
              label="Description"
              id="project-description"
              type="textarea"
              value={postData.description}
              onChange={e =>
                setPostData({ ...postData, description: e.target.value })
              }
              placeholder="Write at least 2 sentences describing the steps you took to make your project and what you learned."
            />
            <div>
              <button
                disabled={
                  !valid() ||
                  ['awaiting', 'succeeded'].includes(submissionSuccess)
                }
                onClick={shipIt}
              >
                {valid()
                  ? submissionSuccessOptions[submissionSuccess]
                  : 'Please fill out all fields.'}
              </button>
            </div>
          </div>
        </div>
        <Posts
          posts={[preview(), ...initialData]}
          breakpointCols={{
            10000: 2,
            1024: 1,
            640: 1,
            480: 1,
            default: 1
          }}
        />
        <div />
      </div>
      <style>
        {`
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-top: 16px;
          }

          .image-drop-input {
            display: none;
          }

          h1 {
            width: 75%;
          }

          input,
          textarea,
          select,
          .dropbox {
            display: block;
            margin-top: 8px;
            margin-bottom: 8px;
            background: var(--colors-sunken);
            color: var(--text);
            font-family: inherit;
            border-radius: 4px;
            border: 0;
            font-size: inherit;
            padding: 8px;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            width: 100%;
          }

          input[type="search"]::-webkit-search-decoration,
          textarea[type="search"]::-webkit-search-decoration,
          select[type="search"]::-webkit-search-decoration {
            display: none;
          }

          button {
            cursor: pointer;
            font-family: inherit;
            font-weight: 800;
            border-radius: 8px;
            transition: transform 0.125s ease-in-out, box-shadow 0.125s ease-in-out;
            margin: 0;
            min-width: 0;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            text-align: center;
            line-height: inherit;
            -webkit-text-decoration: none;
            text-decoration: none;
            padding-left: 16px;
            padding-right: 16px;
            padding-top: 8px;
            padding-bottom: 8px;
            color: #ffffff;
            background-color: #ec3750;
            border: 0;
            margin-top: 8px;
          }
          
          button:focus,
          button:hover {
            box-shadow: var(--shadow-sunken);
            transform: scale(1.0625);
          }
        `}
      </style>
    </div>
  )
}

export async function getServerSideProps({ query }) {
  const { link } = query
  const { getPosts } = require('./api/r/[emoji]')
  const initialData = await getPosts('ship', 4)
  return { props: { link, initialData } }
}
