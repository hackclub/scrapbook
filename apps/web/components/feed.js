import useSWR from 'swr'
import Message from '../components/message'
import Posts from '../components/posts'
import { useState, useEffect } from "react";
const fetcher = url => fetch(url).then(r => r.json())

const toFeedMap = posts =>
  posts.reduce((mappedPosts, post) => {
    mappedPosts[post.id] = post
    return mappedPosts
  }, {})

const Feed = ({
  src = '/api/posts',
  initialData = [],
  children,
  footer,
}) => {
  const normalizedInitialData = Array.isArray(initialData) ? initialData : [];
  const [cursor, setCursor] = useState(null);
  const [feedData, setFeedData] = useState(() => toFeedMap(normalizedInitialData));
  const { data, error } = useSWR(cursor ? `${src}?gt=${cursor}` : src, fetcher, {
    fallbackData: normalizedInitialData,
    refreshInterval: 10000
  });

  useEffect(() => {
    if (error || !data) return;
    if (!Array.isArray(data)) return;
    if (data.length == 0) return;
    setCursor(data[0].timestamp);
  }, []);

  // update to the latest data we have
  useEffect(() => {
    if (error || !data) return;
    if (!Array.isArray(data)) return;
    if (data.length === 0) return;
    // only go ahead to update the feed data if the cursor is not the same as the latest post
    if (data[0].timestamp <= cursor) return;
    setCursor(data[0].timestamp); // set the cursor to always point to the latest post
    setFeedData(currentFeedData => ({
      ...toFeedMap(data),
      ...currentFeedData
    }))
  }, [cursor, data, error]);

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
