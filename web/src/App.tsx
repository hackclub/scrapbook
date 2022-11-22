import { AuthProvider } from '@redwoodjs/auth'
import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'
import { useIsBrowser } from '@redwoodjs/prerender/browserUtils'

import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

import './scaffold.css'
import './index.css'
import { useEffect } from 'react'

const App = () => {
  const browser = useIsBrowser()
  let WebAuthnClient = null
  useEffect(() => {
    const importWebAuthnClient = async () => {
      WebAuthnClient = await import('@redwoodjs/auth/webAuthn');
    }
    importWebAuthnClient()
  }, [])
  return (
    <FatalErrorBoundary page={FatalErrorPage}>
      <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
        <AuthProvider type="dbAuth" client={browser ? WebAuthnClient : null}>
          <RedwoodApolloProvider>
            <Routes />
          </RedwoodApolloProvider>
        </AuthProvider>
      </RedwoodProvider>
    </FatalErrorBoundary>
  )
}

export default App
