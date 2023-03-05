const Profile = ({ closed, setMenuOpen, session }) => (
  <>
    <div className="overlay" style={{ display: closed ? 'none' : 'block' }}>
      <h1 style={{ display: 'flex' }}>
        <span style={{ flexGrow: 1, paddingTop: '36px' }}>
          Edit Your Profile
        </span>
        <span
          class="noselect"
          style={{
            display: 'inline-block',
            transform:
              'rotate(45deg) scale(1.4) translateX(-11px) translateY(11px)',
            cursor: 'pointer',
            color: 'var(--muted)'
          }}
          onClick={() => setMenuOpen(false)}
        >
          +
        </span>
      </h1>
      <form
        action="/api/web/profile/edit"
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '8px',
          flexDirection: 'column'
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
        <button className="lg cta">Save Your Profile</button>
      </form>
    </div>
  </>
)

export default Profile
