import { Toaster } from '@/components/ui/sonner'
import { ClientThemeProvider } from '@/components/website/client-theme-provider'
import { GitHubPagesRouter } from '@/components/website/github-pages-router'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://jsb2010.github.io'),
  title: 'DropSentinel - Advanced File Security Scanner',
  description: 'Real-time file protection with VirusTotal integration. Monitor downloads, detect threats, and keep your system secure with our ultra-modern security scanner.',
  keywords: [
    'virus scanner',
    'file security',
    'malware detection',
    'VirusTotal',
    'real-time protection',
    'download monitoring',
    'threat detection',
    'security software',
    'antivirus',
    'file scanner'
  ],
  authors: [{ name: 'JSB2010', url: 'https://github.com/JSB2010' }],
  creator: 'JSB2010',
  publisher: 'DropSentinel',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dropsentinel.dev',
    title: 'DropSentinel - Advanced File Security Scanner',
    description: 'Real-time file protection with VirusTotal integration. Monitor downloads, detect threats, and keep your system secure.',
    siteName: 'DropSentinel',
    images: [
      {
        url: '/assets/app-icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'DropSentinel Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DropSentinel - Advanced File Security Scanner',
    description: 'Real-time file protection with VirusTotal integration. Monitor downloads, detect threats, and keep your system secure.',
    images: ['/assets/app-icon-512x512.png'],
  },

}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/app-icon.ico" />
        <link rel="apple-touch-icon" href="/assets/app-icon-512x512.png" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GitHubPagesRouter />
          <div className="min-h-screen bg-background">
            {children}
          </div>
          <Toaster />
        </ClientThemeProvider>
      </body>
    </html>
  )
}
