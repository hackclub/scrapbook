import { v4 as uuidv4 } from 'uuid'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Close } from '../components/close'
import { getProviders, signIn, signOut, useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import Link from 'next/link'
import S3 from '../lib/s3'
import useForm from '../lib/use-form'
const fetcher = url => fetch(url).then(r => r.json())

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

export const LoginPopup = ({ closed, setLoginOpen, session }) => {
  const { data, error } = useSWR('/api/web/clubs/my', fetcher, {
    refreshInterval: 5000
  })
  const { status, formProps, useField, setData } = useForm()

  let router = useRouter()
  return (
    <div
      className="overlay-wrapper"
      style={{ display: closed ? 'none' : 'flex' }}
    >
      <div
        className="overlay"
        style={{
          display: closed ? 'none' : 'flex',
          overflowY: 'scroll',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <h1 style={{ fontSize: '2.3em' }}>Sign-in to Scrapbook</h1>
        <div style={{ marginTop: '-12px', fontSize: '18px' }}>
          Member of the{' '}
          <a
            href="https://hackclub.com/slack"
            style={{ color: 'var(--colors-cyan)' }}
            target="_blank"
          >
            Hack Club Slack
          </a>
          ? Use the same email you use for Slack to access your account from the
          web.
        </div>
        <div>
          <input
            placeholder="orpheus@hackclub.com"
            type="email"
            name="email"
            style={{ fontSize: '1.1em', textAlign: 'left' }}
            {...useField('email', 'email', true)}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}
        >
          <button
            className="lg cta-blue"
            onClick={() => {
              let email = useField('email').value
              if (validateEmail(email)) {
                toast.promise(signIn('email', { email, redirect: false }), {
                  loading: `Sending login email...`,
                  success: `Head to your email to login!`,
                  error: <>Error! Could not send login email.</>
                })
                setLoginOpen(false)
                setData({})
              } else {
                toast(`Please enter a valid email.`, {
                  icon: '🚨 '
                })
              }
            }}
          >
            Email My Login Code
          </button>
          <button
            className="lg cta-red"
            onClick={e => {
              e.preventDefault()
              setLoginOpen(false)
            }}
          >
            Cancel
          </button>
        </div>
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
        onClick={() => setLoginOpen(false)}
      >
        <Close />
      </div>
    </div>
  )
}
