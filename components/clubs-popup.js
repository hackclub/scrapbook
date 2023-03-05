import { v4 as uuidv4 } from 'uuid'
import S3 from '../lib/s3'
import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
const fetcher = url => fetch(url).then(r => r.json())

export const ClubsPopup = ({ closed, setClubsOpen, session }) => {
  const { data, error } = useSWR('/api/web/clubs/my', fetcher, {
    refreshInterval: 5000
  })
  return (
    <>
      <div
        className="overlay"
        style={{ display: closed ? 'none' : 'block', overflowY: 'scroll' }}
      >
        <h1 style={{ display: 'flex' }}>
          <span style={{ flexGrow: 1, paddingTop: '36px' }}>Your Clubs</span>
          <span
            class="noselect"
            style={{
              display: 'inline-block',
              transform:
                'rotate(45deg) scale(1.4) translateX(-11px) translateY(11px)',
              cursor: 'pointer',
              color: 'var(--muted)'
            }}
            onClick={() => setClubsOpen(false)}
          >
            +
          </span>
        </h1>
        {data?.clubs.map(club => (
          <Link href={`/clubs/${club.slug}`}>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <img
                src={club.logo}
                style={{
                  height: '72px',
                  width: '72px',
                  borderRadius: '8px',
                  marginTop: '16px'
                }}
              />
              <div>
                <h3>{club.name}</h3>
                <div>
                  {club.members.length} Member{club.members.length != 1 && 's'}{' '}
                  • {club.updates.length} Post{club.updates.length != 1 && 's'}
                </div>
              </div>
            </div>
          </Link>
        ))}

        <details
          style={{
            background: 'var(--dark)',
            padding: '12px',
            borderRadius: '8px',
            marginTop: '24px'
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              fontSize: '1.2em',
              display: 'flex',
              alignItems: 'center',
              paddingTop: '2px'
            }}
          >
            <b style={{ flexGrow: 1 }}>Start A Club</b>
            <b style={{ paddingRight: '8px' }}>▼</b>
          </summary>
          <form
            action="/api/web/clubs/new"
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '8px',
              flexDirection: 'column',
              width: '100%',
              position: 'relative'
            }}
          >
            <div style={{ paddingRight: '16px' }}>
              <label
                style={{
                  marginBottom: '8px',
                  display: 'inline-block',
                  fontSize: '1.1em'
                }}
              >
                Club Name*
              </label>
              <input
                placeholder="Happy Hack Club"
                required
                name="text"
                style={{ background: 'var(--darker)' }}
              />
            </div>
            <div style={{ paddingRight: '16px' }}>
              <label
                style={{
                  marginBottom: '8px',
                  display: 'inline-block',
                  fontSize: '1.1em'
                }}
              >
                Club Location*
              </label>
              <input
                placeholder="Shelburne, Vermont, USA"
                required
                name="location"
                style={{ background: 'var(--darker)' }}
              />
            </div>
            <div style={{ paddingRight: '16px' }}>
              <label
                style={{
                  marginBottom: '8px',
                  display: 'inline-block',
                  fontSize: '1.1em'
                }}
              >
                Club Website
              </label>
              <input
                placeholder="happy.hackclub.com"
                type="url"
                name="website"
                style={{ background: 'var(--darker)' }}
              />
            </div>
            <button className="lg cta-blue">Create</button>
          </form>
        </details>
      </div>
      <style jsx>
        {`
          ::marker {
            list-style-type: none;
          }

          details summary::-webkit-details-marker {
            display: none;
          }

          details > summary {
            list-style: none;
          }
          details > summary::-webkit-details-marker {
            display: none;
          }
        `}
      </style>
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
        onClick={() => setClubsOpen(false)}
      />
    </>
  )
}