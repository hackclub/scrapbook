import { createAuthClient } from 'better-auth/react'
import { genericOAuthClient } from 'better-auth/client/plugins'
import useSWR from 'swr'
import { IDENTITY_PROVIDER_ID, IDENTITY_SCOPES } from './auth-constants'

export const authClient = createAuthClient({
  baseURL: typeof window === 'undefined' ? undefined : window.location.origin,
  basePath: '/api/auth',
  plugins: [genericOAuthClient()]
})

const sessionFetcher = url =>
  fetch(url).then(response => {
    if (response.status === 401) return null
    if (!response.ok) throw new Error('Failed to load session')
    return response.json()
  })

export function useSession() {
  const { data, error, isLoading, mutate } = useSWR('/api/web/session', sessionFetcher)

  return {
    data,
    status: isLoading ? 'loading' : data?.user ? 'authenticated' : 'unauthenticated',
    error,
    refetch: mutate
  }
}

export function signIn(callbackURL = '/') {
  return authClient.signIn.oauth2({
    providerId: IDENTITY_PROVIDER_ID,
    callbackURL,
    scopes: IDENTITY_SCOPES
  })
}

export async function signOut() {
  await authClient.signOut()
  window.location.reload()
}
