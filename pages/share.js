import React, { useState } from 'react'

/*

TODO

- [x] dark mode support
- [x] error handling

*/

const styles = `
  #root {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    flex-direction: column;
    /* font-family: monospace; */
    /* font-size: 12pt; */
    margin: 0px;
  }

  #notifcontent {
    min-width: 300px;
    max-width: 500px;
    width: 60vw;
    padding-bottom: 20px;
    background: var(--theme-ui-colors-sunken,#e0e6ed);
    border-radius: 12px;
    padding: 16px;
  }

  #notifcontent input {
    /* font-family: monospace; */
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
  }

  .notif-button button:hover {
    opacity: 0.8;
    cursor: pointer;
  }

  .notif-header {
    text-align: center;
    margin-bottom: 15px;
  }

  .form-item {
    display: flex;
    align-content: center;
    justify-content: space-between;
    margin: 5px;
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

  .scrapbook-embed {
    border: none;
    width: 80vw;
    height: 50vh;
    border-radius: 5px;
    border: solid 1px grey;
    padding: 10px;
    box-sizing: border-box;
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

// const shipPost = (obj) => 
//   fetch("/api/clubscraps", {
//     method: "POST",
//     mode: "cors",
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(obj)
//   })


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


export default function Page({ link, clubs }) {

  console.log(clubs);

  const [dropping, setDropping] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [linkData, setLinkData] = useState(link ? link : "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState("");
  const [club, setClub] = useState("");

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
    reader.onloadend = function() {
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

      <style jsx>{`

        ${styles}

        body { margin: 0px; } /* existential style margin */

      `}</style>

      <div id="notifcontent">
        <h2 className="notif-header">
          Share your project with your club and the Hack Club community!
        </h2>
        <div>Fill out the form below to post to <a target="_blank" href="https://scrapbook.hackclub.com">Scrapbook</a>!</div>
        <hr></hr>
        <div className="form-item">
          <span>Full Name</span>
          <input 
            id="name" 
            type="text" 
            value={name} 
            onChange={ e => setName(e.target.value) } 
            placeholder="Fiona Hackworth">
            </input>
        </div>

        <div className="form-item">
          <span>Email</span>
          <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={ e => setEmail(e.target.value) } 
            placeholder="fiona@hackclub.com">
            </input>
        </div>

        <div className="form-item">
          <span>Club</span>
          <select onInput={handleClubInput}>
            {clubs.map( (club, i) => <option key={"club:" + i} value={club}>{club}</option>)}
          </select>
        </div>

        <div className="form-item">
          <span>Project Link</span>
          <input 
            id="project-link" 
            type="text" 
            value={linkData} 
            onChange={ e => setLinkData(e.target.value) } 
            placeholder="a link to your project">
            </input>
        </div>


        <div className="form-item">
          <span>Project Image</span>
          <div 
            className="image-drop" 
            style={{ background: dropping ? "#d4f7d3" : ""}}
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
        <div style={{ width: "100%", display: "flex", "flex-direction": "row-reverse" }}>
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
            onChange={ e => setDescription(e.target.value) } 
            placeholder="Write at least 2 sentences describing the steps you took to make your project and what you learned.">
            </textarea>
        </div>


        <div className="notif-button">
          <button disabled={!valid() || ["awaiting", "succeeded"].includes(submissionSuccess)} onClick={shipIt}>
            {valid() ? "Ship It!" : "Please fill out all fields."}
          </button>
        </div>

        {submissionSuccessOptions[submissionSuccess]}

      </div>
    </div>
  )
}

export async function getServerSideProps({ query }) {
  const { link } = query;

  let clubs = await fetch(`https://api2.hackclub.com/v0.1/Club Applications/Clubs Dashboard`)
    .then(res => res.json());

  clubs = sortAlphabetically(clubs.map(club => club.fields["Venue"]));

  return { props: { link, clubs } }
}  





