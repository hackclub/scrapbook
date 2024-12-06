import useSWR from 'swr'
import Message from '../components/message'
import Posts from '../components/posts'
import { orderBy } from 'lodash'
import { useState, useEffect } from "react";
const fetcher = url => fetch(url).then(r => r.json())

const Feed = ({
  src = '/api/posts',
  initialData,
  children,
  footer,
  ...props
}) => {
  const [cursor, setCursor] = useState(null);
  const [feedData, setFeedData] = useState(initialData.reduce((obj, curr) => ({ ...obj, [curr.id]: curr}), {}));
  const { data, error } = useSWR(cursor ? `${src}?gt=${cursor}` : src, fetcher, {
    fallbackData: initialData,
    refreshInterval: 5000
  });

  if (error) {
    return (
      <main className="container">
        <style jsx global>{`
          @media (prefers-color-scheme: dark) {
            :root {
              --colors-text: var(--colors-snow);
            }
          }
          .container {
            max-width: 999rem !important;
          }
        `}</style>
        {children}
        <Posts
          posts={orderBy([initialData, data], a => a.length)[0]}
          swrKey={src}
        />
      </main>
    )
  }

  if (!data) {
    return <Message text="Loading…" />
  }

  // update to the latest data we have
  useEffect(() => {
    if (data.length === 0) return;
    setCursor(data[0].timestamp); // set the cursor to always point to the latest post
    setFeedData({ ...data.reduce((obj, curr) => ({ ...obj, [curr.id]: curr }), {}), ...feedData })
  }, [data]);

  return (
    <main>
      <style jsx global>{`
        @media (prefers-color-scheme: dark) {
          :root {
            --colors-text: var(--colors-snow);
          }
        }
        .container {
          max-width: 999rem !important;
        }
      `}</style>
      {children}
      <Posts posts={Object.values(feedData)} swrKey={src} />
      {footer}
    </main>
  )
}

export default Feed
