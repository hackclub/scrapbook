import Head from 'next/head'
import Meta from '@hackclub/meta'
import Link from 'next/link'
import Icon from '@hackclub/icons'

export default () => (
  <main>
    <Meta as={Head} name="Summer Scrapbook" title="404" />
    <link href="/themes/default.css" rel="stylesheet" />
    <h1>404!</h1>
    <Link href="/">
      <a className="badge">
        <Icon glyph="home" size={32} />
        Go home
      </a>
    </Link>
    <style jsx>{`
      main {
        padding: 4rem 1rem;
        max-width: 640px;
        margin: auto;
        text-align: center;
      }
      h1 {
        -webkit-text-stroke: var(--colors-red);
        -webkit-text-stroke-width: 4px;
        -webkit-text-fill-color: transparent;
        font-size: 128px;
        margin: 0;
      }
      @media (min-width: 32em) {
        h1 {
          -webkit-text-stroke-width: 6px;
          font-size: 256px;
        }
      }
      a {
        font-size: 24px;
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        padding: 12px 24px;
      }
      a :global(svg) {
        margin-right: 8px;
      }
    `}</style>
  </main>
)
