import React, { useState } from 'react'
import Posts from '../components/posts'
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

const styles = `
  #notifcontent {
    padding-bottom: 20px;
    border-radius: 12px;
    padding: 16px;
  }

  .notif-button {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .notif-button button {
    font-family: inherit;
    padding: 5px;
    border-radius: 4px;
    margin: 0px;
    border: 0px;
    box-sizing: border-box;
    border: 1px solid black;
  }

  .notif-button button:hover {
    opacity: 0.8;
    cursor: pointer;
  }

  .notif-header {
    margin-bottom: 15px;
  }

  .form-item select {
    width: 50%;
    padding: 4px;
    border-radius: 4px;
    width: 50%;
    box-sizing: border-box;
    margin: 0px;
    border: 0px;
  }

  .form-item option {
    width: 50%;
  }

  .form-item input {
    padding: 8px;
    border-radius: 4px;
    width: 50%;
    box-sizing: border-box;
    margin: 0px;
    border: 0px;
  }

  .form-item-textarea {
    width: 70%;
    resize: vertical;
    min-height: 70px;
    font-family: inherit;
    padding: 8px;
    border-radius: 4px;
    box-sizing: border-box;
    margin: 0px;
    border: 0px;
  }

  .image-drop {
    border: 1px solid black;
    border-radius: 3px;
    padding: 5px;
    color: darkgrey;
  }

  .image-drop-input {
    display: none;
  }
`

async function shipPost(obj) {
  try {
    const res = await fetch("https://misguided.enterprises/clubscraps/submit", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
    return (await res.json()).ok;
  } catch (err) {
    console.log(err);
    return false;
  }
}

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
  const [imgSrc, setImgSrc] = useState("");
  const [linkData, setLinkData] = useState(link ? link : "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState("");
  const [club, setClub] = useState("");
  const preview = () => ({
    id: 1,
    user: {
      username: name || 'Fiona Hackwoof',
      avatar: emailToPfp(postData.email) || 'https://placedog.net/500'
    },
    text: [description, linkData].join('\n') || 'feed me (woof woof)',
    attachments: [imgSrc || 'https://lawcall.com/wp-content/uploads/2015/03/Dog-Eating.jpg'],
    postedAt: 'just now',
  })

  function preventDefaults(e) {
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
      setImgSrc(reader.result);
    }

    reader.readAsDataURL(files[0]);
  }

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

  const shipIt = async (e) => {
    const link = linkData;

    setSubmissionSuccess("awaiting");

    const ship = {
      name,
      email,
      link,
      image: imgSrc,
      description,
      club
    }

    const shipStatus = await shipPost(ship)

    setSubmissionSuccess(shipStatus ? "succeeded" : "failed");
  }

  const valid = () => {
    const shipFields = [
      name,
      email,
      linkData,
      imgSrc,
      description,
      club
    ]

    return shipFields.every(x => x !== "");
  }

  const handleClubInput = (e) => {
    setClub(e.target.value);
  }

  return (
    <div id="root">
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
        <style jsx>{`

        ${styles}

        body { margin: 0px; } /* existential style margin */

      `}</style>

        <div id="notifcontent" style={{ textAlign: 'left' }}>
          <h1 className="notif-header">
            Share your project with your club and the Hack Club community!
          </h1>
          <div className="form-item">
            <div>Full Name</div>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Fiona Hackworth">
            </input>
          </div>

          <div className="form-item">
            <div>Email</div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="fiona@hackclub.com">
            </input>
          </div>

          <div className="form-item">
            <div>Club</div>
            <select onInput={handleClubInput}>
              <option value=""></option>
              {clubs.map((club, i) => <option key={"club:" + i} value={club}>{club}</option>)}
              <option value="other">other</option>
            </select>
          </div>

          <div className="form-item">
            <div>Project Link</div>
            <input
              id="project-link"
              type="text"
              value={linkData}
              onChange={e => setLinkData(e.target.value)}
              placeholder="a link to your project">
            </input>
          </div>


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
                accept="image/*">
              </input>
            </div>
          </div>
          <div style={{ width: "100%", display: "flex", flexDirection: "row-reverse" }}>
            <img
              style={{
                "maxHeight": "200px",
                borderRadius: 5,
                border: imgSrc === "" ? "none" : "1px dashed black"
              }}
              src={imgSrc}
              className="image-preview">
            </img>
          </div>


          <div className="form-item">
            <div>Description</div>
            <textarea
              className="form-item-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Write at least 2 sentences describing the steps you took to make your project and what you learned.">
            </textarea>
          </div>


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

  clubs = [...new Set(clubs.map(club => club.fields["Venue"]))];
  clubs = sortAlphabetically(clubs);

  clubs = clubs.filter(club => club && club.trim() !== "");

  return { props: { link, clubs, initialData } }
}




