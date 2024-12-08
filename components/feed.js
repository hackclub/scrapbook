import useSWR from 'swr'
import Message from '../components/message'
import Posts from '../components/posts'
import { orderBy } from 'lodash-es'
import { useState, useEffect, useMemo } from "react";
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
          posts={Object.values(feedData)}
          swrKey={src}
        />
      </main>
    )
  }

  if (!data) {
    return <Message text="Loading…" />
  }

  useEffect(() => {
    if (data.length == 0) return;
    setCursor(data[0].timestamp);
  }, []);

  // update to the latest data we have
  useEffect(() => {
    if (data.length === 0) return;
    // only go ahead to update the feed data if the cursor is not the same as the latest post
    if (data[0].timestamp <= cursor) return;
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
