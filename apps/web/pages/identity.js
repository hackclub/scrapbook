import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'

function IdentityStatus({ message, status }) {
  if (status === 'loading') {
    return <p className="mb-4 text-white">Verifying your identity...</p>
  }

  if (status === 'success') {
    return <p className="mb-4 text-green-400">{message}</p>
  }

  if (status === 'pending') {
    return <p className="mb-4 text-yellow-400">{message}</p>
  }

  if (status === 'error') {
    return (
      <p className="mb-4 text-red-400">
        {message.includes('identity.hackclub.com') ? (
          <>
            Your submission got rejected! Go to{' '}
            <a
              href="https://identity.hackclub.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-red-300"
            >
              identity.hackclub.com
            </a>{' '}
            to fix.
          </>
        ) : (
          message
        )}
      </p>
    )
  }

  return null
}

export default function IdentityCallback() {
  const router = useRouter()
  const handledCodeRef = useRef(null)
  const { data: session, status: sessionStatus } = useSession()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!router.isReady) return

    const code = typeof router.query.code === 'string' ? router.query.code : null

    if (!code) {
      setStatus('error')
      setMessage('No authorization code found in the URL.')
      return
    }

    if (sessionStatus === 'loading' || handledCodeRef.current === code) {
      return
    }

    handledCodeRef.current = code

    async function handleIdentityCallback() {
      setStatus('loading')

      if (!session) {
        try {
          await signIn('hc-identity', {
            code,
            callbackUrl: '/login'
          })
        } catch {
          setStatus('error')
          setMessage('Failed to log in with Hack Club Identity. Please try again.')
        }
        return
      }

      try {
        const tokenResponse = await fetch('/api/identity/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })
        const tokenData = await tokenResponse.json()

        if (!tokenResponse.ok) {
          setStatus('error')
          setMessage(
            `Failed to exchange code: ${tokenData.error || 'Unknown error'} (${tokenResponse.status}).`
          )
          return
        }

        if (!tokenData.success) {
          setStatus('error')
          setMessage('Failed to verify identity.')
          return
        }

        const meResponse = await fetch('/api/identity/me')
        const meData = await meResponse.json()

        if (meData.rejection_reason) {
          setStatus('error')
          setMessage('Your submission got rejected! Go to identity.hackclub.com to fix.')
          return
        }

        if (meData.verification_status === 'pending') {
          setStatus('pending')
          setMessage('Your identity verification is pending. Please wait for approval.')
          return
        }

        const isVerified = meData.verification_status === 'verified'
        setStatus(isVerified ? 'success' : 'error')
        setMessage(
          isVerified
            ? 'Identity verified! You may now return to Scrapbook.'
            : 'Identity verification failed. Please try again.'
        )
      } catch (error) {
        handledCodeRef.current = null
        setStatus('error')
        setMessage(
          `Failed to verify identity: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        )
      }
    }

    handleIdentityCallback()
  }, [router.isReady, router.query.code, session, sessionStatus])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div
        className="p-8 rounded-lg shadow-lg max-w-md w-full text-center border"
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderColor: 'rgba(255,255,255,0.1)'
        }}
      >
        <h1 className="text-2xl font-bold mb-4 text-white">Identity Verification</h1>
        <IdentityStatus message={message} status={status} />
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => router.push('/')}
        >
          Return to Scrapbook
        </button>
      </div>
    </div>
  )
}
