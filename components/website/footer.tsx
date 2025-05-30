'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink, Github, Heart, Shield } from 'lucide-react'
import Link from 'next/link'

type FooterLink = {
  name: string
  href: string
  external?: boolean
}

export function WebsiteFooter() {
  const currentYear = new Date().getFullYear()

  const footerLinks: {
    product: FooterLink[]
    support: FooterLink[]
    legal: FooterLink[]
    community: FooterLink[]
  } = {
    product: [
      { name: 'Features', href: '/#features' },
      { name: 'Download', href: '/download' },
      { name: 'Documentation', href: '/docs' },
      { name: 'Changelog', href: '/changelog' },
    ],
    support: [
      { name: 'Documentation', href: '/docs' },
      { name: 'GitHub Issues', href: 'https://github.com/JSB2010/virus-total-scanner-app/issues', external: true },
      { name: 'GitHub Discussions', href: 'https://github.com/JSB2010/virus-total-scanner-app/discussions', external: true },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'License (MIT)', href: 'https://github.com/JSB2010/virus-total-scanner-app/blob/main/LICENSE', external: true },
      { name: 'Security Policy', href: 'https://github.com/JSB2010/virus-total-scanner-app/blob/main/SECURITY.md', external: true },
    ],
    community: [
      { name: 'GitHub', href: 'https://github.com/JSB2010/virus-total-scanner-app', external: true },
      { name: 'Releases', href: 'https://github.com/JSB2010/virus-total-scanner-app/releases', external: true },
      { name: 'Contributing', href: 'https://github.com/JSB2010/virus-total-scanner-app/blob/main/CONTRIBUTING.md', external: true },
      { name: 'Code of Conduct', href: 'https://github.com/JSB2010/virus-total-scanner-app/blob/main/CODE_OF_CONDUCT.md', external: true },
    ]
  }

  return (
    <footer className="bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DropSentinel
              </span>
            </Link>

            <p className="text-muted-foreground mb-6 max-w-md">
              Advanced file security scanner with real-time protection and VirusTotal integration.
              Protect your downloads with modern, intuitive security software.
            </p>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="https://github.com/JSB2010/virus-total-scanner-app" target="_blank">
                  <Github className="w-4 h-4 mr-2" />
                  Star on GitHub
                </Link>
              </Button>


            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
                  >
                    {link.name}
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
                    target={link.external ? '_blank' : undefined}
                  >
                    {link.name}
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
                    target={link.external ? '_blank' : undefined}
                  >
                    {link.name}
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© {currentYear} DropSentinel. All rights reserved.</span>
              <span>•</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for digital security</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
