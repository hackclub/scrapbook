import { v4 as uuidv4 } from 'uuid'
import { useState } from 'react'
import { Optional } from '../components/optional'
import { Close } from '../components/close'
import useSWR from 'swr'
import Link from 'next/link'
import useForm from '../lib/use-form'
const fetcher = url => fetch(url).then(r => r.json())

export const ClubsEditPopup = ({ closed, setClubsOpen, session, club }) => {
  const { status, submit, useField, setData } = useForm(
    `/api/web/clubs/${club.id}/edit`,
    {
      method: 'POST',
      initData: club,
      success: 'Club updated!',
      closingAction: () => setClubsOpen(false),
      initData: club
    }
  )
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
                  display: 'inline-block',
                  fontSize: '1.1em'
                }}
              >
                Name
              </label>
              <input
                placeholder="Happy Hack Club"
                {...useField('name', 'text', true)}
              />
            </div>
            <div style={{ paddingRight: '16px' }}>
              <label
                style={{
                  display: 'inline-block',
                  fontSize: '1.1em'
                }}
              >
                Location
              </label>
              <input
                placeholder="Shelburne, Vermont, USA"
                required
                {...useField('location', 'text', true)}
              />
            </div>
            <div style={{ paddingRight: '16px' }}>
              <label
                style={{
                  display: 'inline-block',
                  fontSize: '1.1em'
                }}
              >
                Banner
              </label>
              <input
                placeholder="https://hackclub.com/banner.png"
                required
                {...useField('banner', 'url', true)}
              />
            </div>
            <div style={{ paddingRight: '16px' }}>
              <label
                style={{
                  display: 'inline-block',
                  fontSize: '1.1em'
                }}
              >
                Logo
              </label>
              <input
                placeholder="https://hackclub.com/logo.png"
                required
                {...useField('logo', 'url', true)}
              />
            </div>
            <div style={{ paddingRight: '16px' }}>
              <label
                style={{
                  display: 'inline-block',
                  fontSize: '1.1em'
                }}
              >
                Website <Optional />
              </label>
              <input
                placeholder="happy.hackclub.com"
                type="url"
                {...useField('website')}
              />
            </div>
            <div style={{ paddingRight: '16px' }}>
              <label
                style={{
                  display: 'inline-block',
                  fontSize: '1.1em'
                }}
              >
                GitHub <Optional />
              </label>
              <input
                placeholder="github.com/hackclub"
                type="url"
                {...useField('github')}
              />
            </div>
            <div style={{ paddingRight: '16px' }}>
              <label
                style={{
                  display: 'inline-block',
                  fontSize: '1.1em'
                }}
              >
                Custom CSS <Optional />
              </label>
              <input
                placeholder="happy.hackclub.com/style.css"
                type="url"
                {...useField('cssURL')}
              />
            </div>
            <div style={{ paddingRight: '16px' }}>
              <label
                style={{
                  display: 'inline-block',
                  fontSize: '1.1em'
                }}
              >
                Custom Domain <Optional />
              </label>
              <input
                placeholder="scrapbook.happy.hackclub.com"
                type="url"
                {...useField('customDomain')}
              />
            </div>
            <div style={{ paddingRight: '16px', gridColumn: `1 / span 2` }}>
              <label
                style={{
                  display: 'inline-block',
                  fontSize: '1.1em'
                }}
              >
                Description <Optional />
              </label>
              <textarea {...useField('description')} />
            </div>
          </form>
          <button
            className="lg cta-blue"
            onClick={e => {
              e.preventDefault()
              submit()
            }}
          >
            Save
          </button>
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
      >
        <Close />
      </div>
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
