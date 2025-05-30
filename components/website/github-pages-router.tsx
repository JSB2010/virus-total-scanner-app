'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function GitHubPagesRouter() {
  const router = useRouter()

  useEffect(() => {
    // Check if we're on the client side and have a redirect parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('/')
      
      if (redirect) {
        // Clean up the redirect parameter and navigate to the intended path
        const cleanPath = redirect.replace(/~and~/g, '&')
        
        // Remove the redirect parameter from the URL
        const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname
        window.history.replaceState({}, '', newUrl)
        
        // Navigate to the intended path
        router.push('/' + cleanPath)
      }
    }
  }, [router])

  return null // This component doesn't render anything
}
