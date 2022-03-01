import React, { useState } from 'react'

/*

TODO

- dark mode support
- error handling

*/

const styles = `
  #root {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    flex-direction: column;
    font-family: monospace;
    font-size: 12pt;
    margin: 0px;
  }

  #notifcontent {
    min-width: 300px;
    max-width: 500px;
    width: 60vw;
    padding-bottom: 20px;
  }

  #notifcontent input {
    font-family: monospace;
  }

  .notif-button {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .notif-button button {
    font-family: monospace;
    padding: 5px;
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

  .form-item input {
    padding: 3px;
    width: 50%;
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
    padding: 5px;
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


export default function Page({ link }) {

  const [dropping, setDropping] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [linkData, setLinkData] = useState(link ? link : "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState("");

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
      description 
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
      description 
    ]

    return shipFields.every(x => x !== "");
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
            placeholder="Describe your project, introduce yourself if this is your first time posting.">
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

Page.getInitialProps = async ({ query }) => {
  const { link } = query;

  return { link }
}  