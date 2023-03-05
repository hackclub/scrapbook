import { v4 as uuidv4 } from 'uuid'
import S3 from '../lib/s3'
import { useState } from 'react'

export const PostEditor = ({ closed, setPostOpen, session }) => {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState([])
  async function uploadFilesToS3(files) {
    let uploadedImages = []
    await Promise.all(
      Array.from(files).map(async file => {
        let uploadedImage
        try {
          uploadedImage = await S3.upload({
            Bucket: 'scrapbook-into-the-redwoods',
            Key: `${uuidv4()}-${file.name}`,
            Body: file
          }).promise()
        } catch (e) {
          alert(
            `Failed to upload the file to the server! Please contact the maintainers to resolve this.`
          )
          console.error(e)
          return
        }
        uploadedImages.push(uploadedImage.Location)
        return uploadedImage.Location
      })
    )
    setUploading(false)
    setImages(uploadedImages)
  }
  return (
    <>
      <div className="overlay" style={{ display: closed ? 'none' : 'block' }}>
        <h1 style={{ display: 'flex' }}>
          <span style={{ flexGrow: 1, paddingTop: '36px' }}>Make A Post</span>
          <span
            class="noselect"
            style={{
              display: 'inline-block',
              transform:
                'rotate(45deg) scale(1.4) translateX(-11px) translateY(11px)',
              cursor: 'pointer',
              color: 'var(--muted)'
            }}
            onClick={() => setPostOpen(false)}
          >
            +
          </span>
        </h1>
        <form
          action="/api/web/post/new"
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '8px',
            flexDirection: 'column'
          }}
        >
          <div>
            <label
              style={{
                marginBottom: '8px',
                display: 'inline-block',
                fontSize: '1.1em'
              }}
            >
              What did you make?
            </label>
            <textarea placeholder="" required name="text" />
          </div>
          <input
            required
            name="attachments"
            value={JSON.stringify(images)}
            style={{ display: 'none' }}
          />
          <div>
            <label
              style={{
                marginBottom: '8px',
                display: 'inline-block',
                fontSize: '1.1em'
              }}
            >
              {uploading
                ? 'Hold tight, uploading your fine photos!'
                : 'Upload Images & Videos of Your Creation:'}
            </label>
            <div class="file-upload">
              <input
                class="file-upload__input"
                multiple="true"
                type="file"
                accept="image/png, image/jpeg, .mp4, .mov, .webm"
                disabled={uploading}
                onChange={event => {
                  setUploading(true)
                  uploadFilesToS3(event.target.files)
                }}
              />
            </div>
          </div>
          <div>
            <label
              style={{
                display: 'inline-block',
                fontSize: '1.1em'
              }}
            >
              Select The Clubs You'd Like To Post To:
            </label>
            {session.user.ClubMember.map(club => club.club).map(club => (
              <div
                style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
              >
                <input
                  type="checkbox"
                  id={`club-${club.id}`}
                  name={`club-${club.id}`}
                  style={{
                    width: 'fit-content',
                    marginRight: '4px'
                  }}
                />
                <img src={club.logo} height="16px" />
                <label for="scales" style={{ display: 'flex' }}>
                  {club.name}
                </label>
              </div>
            ))}
          </div>
          <button
            className="lg cta-blue"
            disabled={uploading}
            style={uploading ? { filter: 'grayscale(1)' } : {}}
          >
            {uploading ? 'Uploading files...' : 'Publish'}
          </button>
        </form>
      </div>
      <div
        style={{
          display: closed ? 'none' : 'block',
          position: 'fixed',
          height: '100vh',
          width: '100vw',
          top: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 500,
          left: 0
        }}
        onClick={() => setPostOpen(false)}
      />
    </>
  )
}