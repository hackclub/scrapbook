import Head from 'next/head'
import { useRouter } from 'next/router'
import Meta from '@hackclub/meta'
import Link from 'next/link'
import Icon from '@hackclub/icons'

const errorPage = () => {
  let router = useRouter()
  return (
    <main>
      <Meta as={Head} name="Hack Club's Scrapbook" title="404" />
      <h1>
        {router.asPath.split('error=')[1] || '404!'}{' '}
        {router.asPath.split('error=')[1] && 'Error'}
      </h1>
      <Link href="/" legacyBehavior>
        <a className="badge">
          <Icon glyph="home" size={32} />
          Go home
        </a>
      </Link>
      <style>{`
      main {
        padding: 32px 16px;
        text-align: center;
      }
      h1 {
        color: var(--colors-purple);
        -webkit-text-stroke: currentColor;
        -webkit-text-stroke-width: ${
          router.asPath.split('error=')[1] ? '1px' : '2px'
        };
        -webkit-text-fill-color: var(--colors-sheet);
        font-family: var(--fonts-display);
        font-size: ${router.asPath.split('error=')[1] ? '32px' : '128px'};
        margin: 0;
        line-height: 1.25;
        letter-spacing: 0.05em;
      }
      @media (min-width: 32em) {
        h1 {
          -webkit-text-stroke-width: ${
            router.asPath.split('error=')[1] ? '2px' : '4px'
          };
          font-size: ${router.asPath.split('error=')[1] ? '72px' : '256px'};
        }
      }
    `}</style>

      <style jsx>{`
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
}

export default errorPage
