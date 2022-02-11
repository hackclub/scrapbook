export const stripColons = str => {
  const colonIndex = str.indexOf(':')
  if (colonIndex > -1) {
    // :emoji:
    if (colonIndex === str.length - 1) {
      str = str.substring(0, colonIndex)
      return stripColons(str)
    } else {
      str = str.substr(colonIndex + 1)
      return stripColons(str)
    }
  }
  return str
}

export const emojiInfo = {
  'zachday-2020': {
    css: 'https://gist.githubusercontent.com/cjdenio/efc9f7645025288725c2d2e5aa095ccf/raw/cc90f61afdcae44c8819ee7e2b0ac021c5d6abe8/zachday-2020.css'
  },
  gamelab: {
    css: '/themes/gamelab.css',
    customComponent: (
      <>
        <p className="header-text">
          This page contains all the projects Hack Clubbers have built using{' '}
          <a href="https://github.com/hackclub/gamelab" target="_blank">
            gamelab
          </a>
          , an open-source game engine for beginners.
          <br />
          <br />
          You can get your own projects on this page by posting a Game Lab share
          link in the #scrapbook channel of the Hack Club Slack.
          <br />
          <br />
          Click on a cartridge to try the game!
          <style>
            {`
            .nav {
              color: #fff;
              background: #f46b45;
              background: linear-gradient(to right, #eea849, #f46b45);
            }
            .nav-link {
              color: #fff;
            }

            .post-text {
              display: none;
            }
            .post {
              background: var(--lighter);
            }
            @media (prefers-color-scheme: dark) {
              .post {
                background: var(--dark);
              }
            }
          `}
          </style>
        </p>
      </>
    )
  },
  'summer-of-making': {
    customComponent: (
      <>
        <p className="post-text">
          This page contains everything Hack Clubbers got up to over the{' '}
          <a href="https://summer.hackclub.com/">
            2020&nbsp;Summer&nbsp;of&nbsp;Making
          </a>
          . Scrapbook was originally built for the summer and whilst it’s now a
          permanent feature of the community, we’ve kept this page up as an
          archive.
          <style>
            {`
            .nav {
              color: #fff;
              background: #f46b45;
              background: linear-gradient(to right, #eea849, #f46b45);
            }
            .nav-link {
              color: #fff;
            }
          `}
          </style>
        </p>
        )
      </>
    )
  }
}
