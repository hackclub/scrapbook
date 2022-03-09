import React, { useState } from 'react'
import Posts from '../components/posts'
import Input from '../components/input'
import { emailToPfp } from '../lib/email'

/*
TODO
- [x] see other scrapbook posts
- [x] see preview of your own scrapbook post
- [ ] clubs dropdown autofill
- [ ] get pfp (figure out implementation)
- [x] page scrolls horizontally (fix padding)
- [x] page scrolls vertically
- [ ] autofill image from url
*/

const submissionSuccessOptions = {
  "": "",
  "succeeded": <div>Post Submitted!</div>,
  "failed": <div>Post Failed!</div>,
  "awaiting": <div>Shipping Post!</div>,
}

const sortAlphabetically = (arr) => arr.sort((a, b) => {
  a = a.toLowerCase();
  b = b.toLowerCase();

  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
})

export default function Page({ link, clubs, initialData }) {
  const [dropping, setDropping] = useState(false);
  const [postData, setPostData] = useState({
    image: '',
    name: '',
    email: '',
    description: '',
    club: '',
    link: ''
  });
  
  const [submissionSuccess, setSubmissionSuccess] = useState("");
  const preview = () => ({
    id: 1,
    user: {
      username: postData.name || 'Fiona Hackwoof',
      avatar: emailToPfp(postData.email) || 'https://placedog.net/500'
    },
    text: [postData.description, postData.link].join('\n') || 'feed me (woof woof)',
    attachments: [postData.image || 'https://lawcall.com/wp-content/uploads/2015/03/Dog-Eating.jpg'],
    postedAt: 'just now',
  })

  const onDragOver = e => {
    preventDefaults(e);
  }
  
  const onDragEnter = e => {
    preventDefaults(e);
    setDropping(true);
  }
  
  const onDragLeave = e => {
    preventDefaults(e);
    setDropping(false);
  }
  
  const preventDefaults = e =>  {
    e.preventDefault();
    e.stopPropagation();
  }

  const onDrop = (e) => {
    preventDefaults(e);
    const dt = e.dataTransfer;
    const files = dt.files;
    const input = document.querySelector(".image-drop-input");
    input.files = files;
    setDropping(false);
    const reader = new FileReader();
    reader.onloadend = function () {
      updatePostState(image, reader.result);
    }
    reader.readAsDataURL(files[0]);
  }

  const shipIt = async (e) => {
    setSubmissionSuccess("awaiting");
    const { ok } = await fetch(`/api/share`, {method: "POST", body: postData})
      .then(r => r.json())
    setSubmissionSuccess(ok ? "succeeded" : "failed");
  }

  const valid = () => {
    return Object.values(postData).every(x => x !== "");
  }

  return (
    <div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
        <div id="notifcontent" style={{ textAlign: 'left' }}>
          <h1 className="notif-header">
            Share your project with your club and the Hack Club community!
          </h1>
          <Input  
            label="Full Name"  
            id="name"
            type="text"
            value={postData.name}
            onChange={e => setPostData({...postData, name: e.target.value})}
          />
          <Input  
            label="Email"  
            id="email"
            type="email"
            value={postData.email}
            onChange={e => setPostData({...postData, email: e.target.value})}
          />
          <Input  
            label="Club"  
            id="club"
            value={postData.club}
            onChange={e => setPostData({...postData, club: e.target.value})}
          />
          <Input  
            label="Project Link"  
            id="project-link"
            type="type"
            value={postData.link}
            onChange={e => setPostData({...postData, link: e.target.value})}
          />
          <div className="form-item">
            <span>Project Image</span>
            <div
              className="image-drop"
              style={{ background: dropping ? "#d4f7d3" : "" }}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}>
              Drop image here.
              <input
                className="image-drop-input"
                type="file"
                id="img"
                name="img"
                accept="image/*"
                
              >
              </input>
            </div>
          </div>
          <Input  
            label="Description"  
            id="project-description"
            type="textarea"
            value={postData.description}
            onChange={e => updatePostState("description", e.target.value)}
            placeholder="Write at least 2 sentences describing the steps you took to make your project and what you learned."
          />
          <div className="notif-button">
            <button disabled={!valid() || ["awaiting", "succeeded"].includes(submissionSuccess)} onClick={shipIt}>
              {valid() ? "Ship It!" : "Please fill out all fields."}
            </button>
          </div>
          {submissionSuccessOptions[submissionSuccess]}
          <hr />
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
    </div>
  )
}

export async function getServerSideProps({ query }) {
  const { link } = query;
  const { getPosts } = require('./api/r/[emoji]')
  const initialData = await getPosts('ship', 4)
  let clubs = await fetch(`https://api2.hackclub.com/v0.1/Club Applications/Clubs Dashboard`)
    .then(res => res.json());
  clubs = sortAlphabetically([...new Set(clubs.map(club => club.fields["Venue"]))]);
  clubs = clubs.filter(club => club && club.trim() !== "");
  return { props: { link, clubs, initialData } }
}
