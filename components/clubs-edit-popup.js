import { v4 as uuidv4 } from 'uuid'
import S3 from '../lib/s3'
import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
const fetcher = url => fetch(url).then(r => r.json())

export const ClubsEditPopup = ({ closed, setClubsOpen, session, club }) => {
  return (
    <div
      className="overlay-wrapper"
      style={{ display: closed ? 'none' : 'flex' }}
    >
      <div
        className="overlay"
        style={{ display: closed ? 'none' : 'block', overflowY: 'scroll' }}
      >
        <h1 style={{ fontSize: '2.3em' }}>Edit Club Page</h1>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexDirection: 'column'
          }}
        >
          <form
            action={`/api/web/clubs/${club.id}/edit`}
            style={{
              display: 'grid',
              gap: '16px',
              marginTop: '8px',
              gridTemplateColumns: '1fr 1fr'
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
                Name
              </label>
              <input
                placeholder="Happy Hack Club"
                required
                name="name"
                defaultValue={club.name}
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
                Location
              </label>
              <input
                placeholder="Shelburne, Vermont, USA"
                required
                name="location"
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
                Banner
              </label>
              <input
                placeholder="https://hackclub.com/banner.png"
                required
                name="banner"
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
                Logo
              </label>
              <input
                placeholder="https://hackclub.com/logo.png"
                required
                name="logo"
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
                GitHub
              </label>
              <input
                placeholder="github.com/hackclub"
                type="url"
                name="github"
                defaultValue={club.github}
              />
            </div>
          </form>
          <button className="lg cta-blue">Save</button>
          <button
            className="lg cta-red"
            onClick={e => {
              e.preventDefault()
              setClubsOpen(false)
            }}
          >
            Cancel
          </button>
        </div>
      </div>
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
      {!closed && (
        <style>
          {`
        body {
          height: 100%;
          overflow-y: hidden; 
        }  
      `}
        </style>
      )}
    </div>
  )
}
