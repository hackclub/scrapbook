import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn, SessionProvider } from "next-auth/react";

function IdentityCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<'loading'|'success'|'error'|'pending'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setStatus('error');
      setMessage('No authorization code found in the URL.');
      return;
    }

    // Wait for session status to be determined
    if (sessionStatus === 'loading') {
      return;
    }

    // Prevent multiple executions of the same code
    let executed = false;

    async function handleIdentityCallback() {
      if (executed) return;
      executed = true;
      
      setStatus('loading');
      
      // If NOT logged in, use code for LOGIN
      if (!session) {
        console.log('No session found, using code for login');
        try {
          await signIn("hc-identity", { 
            code, 
            callbackUrl: "/login" // include  a success message here if successful and redirect to landing page
          });
        } catch (error) {
          console.error('Login error:', error);
          setStatus('error');
          setMessage('Failed to log in with Hack Club Identity. Please try again.');
        }
        return;
      }
      
      // If ALREADY logged in, use code for VERIFICATION
      console.log('Session found, using code for identity verification');
      try {
        const response = await fetch('/api/identity/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await response.json();
        console.log('Token response:', response.status, data);
        if (!response.ok) {
          setStatus('error');
          setMessage(`Failed to exchange code: ${data.error || 'Unknown error'} (${response.status}). Details: ${JSON.stringify(data.details || {})}`);
          return;
        }
        if (data.success) {
            const response2 = await fetch('/api/identity/me');
            const data2 = await response2.json();
            console.log(data2);
          
          if (data2.rejection_reason) {
            setStatus('error');
            setMessage('Your submission got rejected! Go to identity.hackclub.com to fix.');
            return;
          }
          
          if (data2.verification_status === 'pending') {
            setStatus('pending');
            setMessage('Your identity verification is pending. Please wait for approval.');
            return;
          }
          
          setStatus(data2.verification_status === 'verified' ? 'success' :  'error');
          setMessage(data2.verification_status === 'verified' ? 'Identity verified! You may now return to Scrapbook.' : 'Identity verification failed. Please try again.');
        } else {
          setStatus('error');
          setMessage('Failed to verify identity.');
        }
      } catch (error) {
        setStatus('error');
        setMessage(`Failed to verify identity: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    handleIdentityCallback();
  }, [searchParams, session, sessionStatus]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="p-8 rounded-lg shadow-lg max-w-md w-full text-center border" style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <h1 className="text-2xl font-bold mb-4 text-white">Identity Verification</h1>
        {status === 'loading' && <p className="mb-4 text-white">Verifying your identity...</p>}
        {status === 'success' && <p className="mb-4 text-green-400">{message}</p>}
        {status === 'pending' && <p className="mb-4 text-yellow-400">{message}</p>}
        {status === 'error' && (
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
        )}
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => router.push('/')}
        >
          Return to Scrapbook
        </button>
      </div>
    </div>
  );
}

export default function IdentityCallback() {
  return (
    <SessionProvider>
      <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
          <div className="p-8 rounded-lg shadow-lg max-w-md w-full text-center border" style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <h1 className="text-2xl font-bold mb-4 text-white">Identity Verification</h1>
            <p className="mb-4 text-white">Loading...</p>
          </div>
        </div>
      }>
        <IdentityCallbackContent />
      </Suspense>
    </SessionProvider>
  );
} 
