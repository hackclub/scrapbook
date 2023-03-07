const Profile = ({ closed, setMenuOpen, session }) => (
  <div className="overlay-wrapper" style={{ display: closed ? 'none' : 'flex' }}>
    <div className="overlay" style={{ display: closed ? 'none' : 'block' }}>
      <h1 style={{ fontSize: '2.3em' }}>
        Edit Your Profile
      </h1>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexDirection: 'column'
        }}
      >
      <form
        action="/api/web/profile/edit"
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
            name="email"
            defaultValue={session.user.email}
          ></input>
        </div>
        <div>
          <label>Username</label>
          <input
            placeholder="sampoder"
            required
            name="username"
            defaultValue={session.user.username}
          ></input>
        </div>
        <div>
          <label>Pronouns</label>
          <input
            placeholder="they/them/theirs"
            required
            name="pronouns"
            defaultValue={session.user.pronouns}
          ></input>
        </div>
        <div>
          <label>GitHub Username</label>
          <input
            placeholder="sampoder"
            name="github"
            defaultValue={session.user.github?.replace(
              'https://github.com/',
              ''
            )}
          ></input>
        </div>
        <div>
          <label>Website URL</label>
          <input
            placeholder="sampoder.com"
            name="website"
            defaultValue={session.user.website
              ?.replace('https://', '')
              .replace('http://', '')}
          ></input>
        </div>
        <div>
          <label>CSS URL</label>
          <input
            placeholder="css.hackclub.com/theme.css"
            name="cssURL"
            defaultValue={session.user.cssURL
              ?.replace('https://', '')
              .replace('http://', '')}
          ></input>
        </div>
      </form>
      <button 
        className="lg cta-blue" 
        style={{ marginTop: '4px' }}
      >
        Save Your Profile
      </button>
      <button
        className="lg cta-red"
        onClick={((e) => {
          e.preventDefault();
          setMenuOpen(false);
        })}
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
    />
    {!closed && <style>{`
      body {
        height: 100%;
        overflow-y: hidden; 
      }  
    `}
    </style>}
  </div>
)

export default Profile
