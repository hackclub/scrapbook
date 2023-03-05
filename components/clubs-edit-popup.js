import { v4 as uuidv4 } from 'uuid'
import S3 from '../lib/s3'
import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
const fetcher = url => fetch(url).then(r => r.json())

export const ClubsEditPopup = ({ closed, setClubsOpen, session, club }) => {
  return (
    <>
      <div
        className="overlay"
        style={{ display: closed ? 'none' : 'block', overflowY: 'scroll' }}
      >
        <h1 style={{ display: 'flex' }}>
          <span style={{ flexGrow: 1, paddingTop: '36px' }}>
            Edit Club Page
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
            onClick={() => setClubsOpen(false)}
          >
            +
          </span>
        </h1>

        <form
          action={`/api/web/clubs/${club.id}/edit`}
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
              Name*
            </label>
            <input
              placeholder="Happy Hack Club"
              required
              name="name"
              defaultValue={club.name}
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
              Location*
            </label>
            <input
              placeholder="Shelburne, Vermont, USA"
              required
              name="location"
              style={{ background: 'var(--darker)' }}
              defaultValue={club.location}
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
              Banner*
            </label>
            <input
              placeholder="https://hackclub.com/banner.png"
              required
              name="banner"
              style={{ background: 'var(--darker)' }}
              defaultValue={club.banner}
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
              Logo*
            </label>
            <input
              placeholder="https://hackclub.com/logo.png"
              required
              name="logo"
              style={{ background: 'var(--darker)' }}
              defaultValue={club.logo}
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
              Website
            </label>
            <input
              placeholder="happy.hackclub.com"
              type="url"
              name="website"
              style={{ background: 'var(--darker)' }}
              defaultValue={club.website}
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
              Github
            </label>
            <input
              placeholder="github.com/hackclub"
              type="url"
              name="github"
              style={{ background: 'var(--darker)' }}
              defaultValue={club.github}
            />
          </div>
          <button className="lg cta-blue">Save</button>
        </form>
      </div>
      <style jsx>
        {`
          .overlay {
            padding: 16px 32px;
            color: var(--white);
            position: fixed;
            overflow-y: scroll;
            min-height: 100vh;
            height: 100vh;
            top: 0;
            width: 100vw;
            max-width: 400px;
            right: 0;
            z-index: 999;
            background: var(--colors-background);
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
