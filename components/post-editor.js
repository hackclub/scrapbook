import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/router'
import S3 from '../lib/s3'
import { useState } from 'react'
import useForm from '../lib/use-form'

export const PostEditor = ({ closed, setPostOpen, session }) => {
  const [uploading, setUploading] = useState(false)
  let router = useRouter()
  const { status, submit, useField, setData, setDataValue } = useForm(
    '/api/web/post/new',
    {
      method: 'POST',
      success: 'Post created!',
      closingAction: () => {
        setPostOpen(false)
      },
      router: router,
      clearOnSubmit: 3500,
      initData: {
        attachments: null
      },
      requiredFields: ['attachments']
    }
  )
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
    setDataValue('attachments', uploadedImages)
  }
  return (
    <div
      className="overlay-wrapper"
      style={{ display: closed ? 'none' : 'flex' }}
    >
      <div className="overlay" style={{ display: closed ? 'none' : 'block' }}>
        <h1 style={{ fontSize: '2.3em' }}>Post to Scrapbook</h1>
        <form
          action="/api/web/post/new"
          style={{
            display: 'flex',
            gap: '16px',
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
              What did you make? Tell us all about it!
            </label>
            <textarea
              placeholder=""
              required
              name="text"
              {...useField('text', 'text', true)}
            />
          </div>
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
                : `We'd love to see some photos or videos of that!`}
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
          {session.user.ClubMember.length != 0 && (
            <div>
              <label
                style={{
                  display: 'inline-block',
                  fontSize: '1.1em',
                  marginBottom: '8px'
                }}
              >
                Did you make this in a club? Post it to your club's page!
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {session.user.ClubMember.map(club => club.club).map(club => (
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      alignItems: 'center'
                    }}
                    key={`club-${club.id}`}
                  >
                    <input
                      type="checkbox"
                      id={`club-${club.id}`}
                      name={`club-${club.id}`}
                      style={{
                        width: 'fit-content',
                        marginRight: '2px'
                      }}
                      {...useField(`club-${club.id}`, `checkbox`)}
                    />
                    <img
                      src={club.logo}
                      height="14px"
                      style={{ borderRadius: '4px' }}
                    />
                    <label
                      for="scales"
                      style={{ display: 'flex', fontSize: '1.1em' }}
                    >
                      {club.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            className="lg cta-blue"
            disabled={uploading}
            style={uploading ? { filter: 'grayscale(1)' } : {}}
            onClick={e => {
              e.preventDefault()
              submit()
            }}
          >
            {uploading ? 'Uploading files...' : 'Publish'}
          </button>
          <button
            className="lg cta-red"
            onClick={e => {
              e.preventDefault()
              setPostOpen(false)
            }}
          >
            Cancel
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
      {!closed && (
        <style>
          {`
        body {
          height: 100%;
          overflow-y: hidden; 
        }  
      `}
        </style>
      )}
    </div>
  )
}
