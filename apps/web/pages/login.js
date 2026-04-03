import { signIn } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return

    const code = typeof router.query.code === 'string' ? router.query.code : null

    if (code) {
      signIn('hc-identity', { code, callbackUrl: '/' })
    }
  }, [router.isReady, router.query.code])

  return (
    <div>
      <h1>Logging you in...</h1>
    </div>
  )
}
