'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function GitHubPagesRouter() {
  const router = useRouter()

  useEffect(() => {
    // Check if we're on the client side and have a stored redirect path
    if (typeof window !== 'undefined') {
      const redirectPath = sessionStorage.getItem('redirectPath')

      if (redirectPath && redirectPath !== '/') {
        // Clear the stored path
        sessionStorage.removeItem('redirectPath')

        // Navigate to the intended path within the website structure
        // Since we're in the website layout, we need to navigate to the website route
        router.push('/website' + redirectPath)
      }
    }
  }, [router])

  return null // This component doesn't render anything
}
