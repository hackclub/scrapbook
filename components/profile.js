const Profile = ({ closed, setMenuOpen, session }) => (
  <>
    <div className="overlay" style={{ display: closed ? 'none' : 'block' }}>
      <h1 style={{ display: 'flex' }}>
        <span style={{ flexGrow: 1, paddingTop: '36px' }}>Edit Your Profile</span>
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
      <form action="/api/web/profile/edit" style={{display: 'flex', gap: '16px', marginTop: '8px', flexDirection: 'column'}}>
        <div>
          <label style={{marginBottom: '8px'}}>Email Address</label>
          <input placeholder="sam@hackclub.com" required name="email" defaultValue={session.user.email}></input>
        </div>
        <div>
          <label style={{marginBottom: '8px'}}>Username</label>
          <input placeholder="sampoder" required name="username" defaultValue={session.user.username}></input>
        </div>
        <div>
          <label style={{marginBottom: '8px'}}>Pronouns</label>
          <input placeholder="they/them/theirs" required name="pronouns" defaultValue={session.user.pronouns}></input>
        </div>
        <div>
          <label style={{marginBottom: '8px'}}>GitHub Username</label>
          <input placeholder="sampoder" name="github" defaultValue={session.user.github?.replace("https://github.com/", "")}></input>
        </div>
        <div>
          <label style={{marginBottom: '8px'}}>Website URL</label>
          <input placeholder="sampoder.com" name="website" defaultValue={session.user.website?.replace("https://", "").replace("http://", "")}></input>
        </div>
        <div>
          <label style={{marginBottom: '8px'}}>CSS URL</label>
          <input placeholder="css.hackclub.com/theme.css" name="cssURL" defaultValue={session.user.cssURL?.replace("https://", "").replace("http://", "")}></input>
        </div>
        <button className="lg cta">
          Save Your Profile
        </button>
      </form>
    </div>
    <style jsx>
      {`
        .overlay {
          padding: 16px 32px;
          color: var(--white);
          position: absolute;
          min-height: 100vh;
          height: 100vh;
          top: 0;
          width: 100vw;
          max-width: 400px;
          right: 0;
          z-index: 999;
          background: var(--colors-background);
          border-left: 1px solid var(--muted);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.0625),
            0 8px 12px rgba(0, 0, 0, 0.125);
        }

        input,
        textarea,
        select {
          background: var(--dark);
          color: var(--text);
          font-family: inherit;
          border-radius: var(--radii-default);
          border: 0;
          font-size: inherit;
          padding: var(--spacing-2);
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          width: 100%;
        }

        input::-webkit-input-placeholder,
        input::-moz-placeholder,
        input:-ms-input-placeholder,
        textarea::-webkit-input-placeholder,
        textarea::-moz-placeholder,
        textarea:-ms-input-placeholder,
        select::-webkit-input-placeholder,
        select::-moz-placeholder,
        select:-ms-input-placeholder {
          color: var(--muted);
        }

        input[type='search']::-webkit-search-decoration,
        textarea[type='search']::-webkit-search-decoration,
        select[type='search']::-webkit-search-decoration {
          display: none;
        }

        input[type='checkbox'] {
          -webkit-appearance: checkbox;
          -moz-appearance: checkbox;
          appearance: checkbox;
        }
      `}
    </style>
  </>
)

export default Profile
