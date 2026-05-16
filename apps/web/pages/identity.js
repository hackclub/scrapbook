import { useEffect } from 'react'
import { signIn } from '../lib/auth-client'

export default function Identity() {
  useEffect(() => {
    signIn('/')
  }, [])

  return (
    <div>
      <h1>Redirecting you to Hack Club Auth...</h1>
    </div>
  )
}
