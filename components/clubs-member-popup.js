import { v4 as uuidv4 } from 'uuid'
import S3 from '../lib/s3'
import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
const fetcher = url => fetch(url).then(r => r.json())

export const ClubsMemberPopup = ({ closed, setClubsOpen, session, club }) => {
  return (
    <>
      <div
        className="overlay"
        style={{ display: closed ? 'none' : 'block', overflowY: 'scroll' }}
      >
        <h1 style={{ display: 'flex' }}>
          <span
            style={{ flexGrow: 1, paddingTop: '36px', paddingBottom: '12px' }}
          >
            Manage Members
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
        {club.members.map(member => (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <img
              src={member.account.avatar}
              height="48px"
              style={{ borderRadius: '4px' }}
            />
            <div>
              {club.members.length != 0 ? (
                <a
                  href={`/api/web/clubs/${club.id}/remove-member?member=${member.id}&slug=${club.slug}`}
                  className="username"
                >
                  {member.account.username}
                </a>
              ) : (
                <b>{member.account.username}</b>
              )}
              <br />
              {member.account.updates} Posts {member.admin && <>(Admin)</>}
            </div>
          </div>
        ))}
        <div
          style={{
            background: 'var(--dark)',
            padding: '12px',
            borderRadius: '8px',
            marginTop: '12px'
          }}
        >
          <form
            action={`/api/web/clubs/${club.id}/add-member`}
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '8px',
              flexDirection: 'column',
              width: '100%',
              position: 'relative'
            }}
          >
            <div style={{ paddingRight: '16px' }}>
              <input
                placeholder="harold@hackclub.com"
                required
                name="email"
                style={{ background: 'var(--darker)' }}
              />
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                  marginTop: '8px'
                }}
              >
                <input
                  type="checkbox"
                  name={`admin`}
                  style={{
                    width: 'fit-content',
                    marginRight: '4px'
                  }}
                />
                <label style={{ display: 'flex' }}>Admin Access</label>
              </div>
            </div>
            <button className="lg cta-blue">Add Member</button>
          </form>
        </div>
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
          .username:hover {
            text-decoration: line-through;
          }
          .username {
            text-decoration: none;
            color: white;
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
