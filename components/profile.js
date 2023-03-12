import { Optional } from '../components/optional'
import { Close } from '../components/close'
import useForm from '../lib/use-form'

const Profile = ({ closed, setMenuOpen, session }) => {
  const { status, submit, useField, setData } = useForm(
    '/api/web/profile/edit',
    {
      method: 'POST',
      initData: session.user,
      success: 'Profile updated!',
      closingAction: setMenuOpen
    }
  )
  return (
    <div
      className="overlay-wrapper"
      style={{ display: closed ? 'none' : 'flex' }}
    >
      <div className="overlay" style={{ display: closed ? 'none' : 'block' }}>
        <h1 style={{ fontSize: '2.3em' }}>Edit Your Profile</h1>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexDirection: 'column'
          }}
        >
          <form
            style={{
              display: 'grid',
              gap: '16px',
              marginTop: '8px',
              gridTemplateColumns: '1fr 1fr'
            }}
          >
            <div>
              <label>Email Address</label>
              <input
                placeholder="sam@hackclub.com"
                required
                {...useField('email', 'email', true)}
              ></input>
            </div>
            <div>
              <label>Username</label>
              <input
                placeholder="sampoder"
                required
                {...useField('username', 'text', true)}
              ></input>
            </div>
            <div>
              <label>
                Pronouns <Optional />
              </label>
              <input
                placeholder="they/them/theirs"
                required
                {...useField('pronouns')}
              ></input>
            </div>
            <div>
              <label>
                GitHub URL <Optional />
              </label>
              <input placeholder="sampoder" {...useField('github')}></input>
            </div>
            <div>
              <label>
                Website URL <Optional />
              </label>
              <input
                placeholder="sampoder.com"
                {...useField('website')}
              ></input>
            </div>
            <div>
              <label>
                CSS URL <Optional />
              </label>
              <input
                placeholder="css.hackclub.com/theme.css"
                {...useField('cssURL')}
              ></input>
            </div>
            <div style={{ gridColumn: `1 / span 2` }}>
              <label>
                Custom Domain <Optional />
              </label>
              <input
                placeholder="orpheus.hackclub.com"
                {...useField('customDomain')}
              ></input>
            </div>
          </form>
          <button
            className="lg cta-blue"
            style={{ marginTop: '4px' }}
            onClick={e => {
              submit()
            }}
          >
            Save Your Profile
          </button>
          <button
            className="lg cta-red"
            onClick={e => {
              e.preventDefault()
              setMenuOpen(false)
            }}
          >
            Cancel
          </button>
        </div>
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
        onClick={() => setMenuOpen(false)}
      >
        <Close />
      </div>
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

export default Profile
