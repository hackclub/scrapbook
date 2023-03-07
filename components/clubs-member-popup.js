import { v4 as uuidv4 } from 'uuid'
import S3 from '../lib/s3'
import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
const fetcher = url => fetch(url).then(r => r.json())

export const ClubsMemberPopup = ({ closed, setClubsOpen, session, club }) => {
  return (
    <div className="overlay-wrapper" style={{ display: closed ? 'none' : 'flex' }}>
      <div
        className="overlay"
        style={{ display: closed ? 'none' : 'block', overflowY: 'scroll' }}
      >
        <h1 style={{ fontSize: '2.3em', marginBottom: '8px' }}>
          Manage Members
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
            background: 'var(--colors-dark)',
            padding: '12px',
            borderRadius: '8px',
            marginTop: '18px'
          }}
        >
          <h2>Add People</h2>
          <form
            action={`/api/web/clubs/${club.id}/add-member`}
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '4px',
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
                style={{ background: 'var(--colors-darker)' }}
              />
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <button className="lg cta-blue">Add Member</button>
              <button className="lg cta-green">Add Admin</button>
            </div>
          </form>
        </div>
      </div>
      <style jsx>
        {`
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
    </div>
  )
}
