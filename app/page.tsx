'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import App from '../src/App'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Check if we're in a browser environment and if this is the website build
    if (typeof window !== 'undefined' && process.env.BUILD_WEBSITE === 'true') {
      // Redirect to website homepage for static builds
      router.push('/website')
    }
  }, [router])

  // For the Electron app, render the main App component
  if (process.env.BUILD_WEBSITE === 'true') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting to DropSentinel Website...</h1>
          <p className="text-muted-foreground">
            If you're not redirected automatically, <a href="/website" className="text-primary hover:underline">click here</a>.
          </p>
        </div>
      </div>
    )
  }

  return <App />
}
