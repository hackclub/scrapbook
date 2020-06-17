import Head from 'next/head'
import Meta from '@hackclub/meta'
import Link from 'next/link'
import Icon from '@hackclub/icons'

export default () => (
  <main>
    <Meta as={Head} name="Summer Scrapbook" title="404" />
    <link
      href="https://fonts.googleapis.com/css2?family=Shrikhand&display=swap"
      rel="stylesheet"
    />
    <h1>404!</h1>
    <Link href="/">
      <a className="badge">
        <Icon glyph="home" size={32} />
        Go home
      </a>
    </Link>
    <style jsx>{`
      main {
        padding: 32px 16px;
        text-align: center;
      }
      h1 {
        color: var(--colors-purple);
        -webkit-text-stroke: currentColor;
        -webkit-text-stroke-width: 2px;
        -webkit-text-fill-color: var(--colors-sheet);
        font-family: var(--fonts-display);
        font-size: 128px;
        margin: 0;
        line-height: 1.25;
      }
      @media (min-width: 32em) {
        h1 {
          -webkit-text-stroke-width: 4px;
          font-size: 256px;
        }
      }
      a {
        font-size: 24px;
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        padding: 12px 24px;
        background-color: var(--colors-cyan);
      }
      a :global(svg) {
        margin-right: 8px;
      }
    `}</style>
  </main>
)
