'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WebsiteFooter } from '@/components/website/footer'
import { WebsiteHeader } from '@/components/website/header'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Download,
  ExternalLink,
  GitBranch,
  HardDrive,
  Monitor,
  Package,
  Shield
} from 'lucide-react'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const platforms = [
  {
    name: "Windows",
    icon: "🪟",
    version: "Windows 10, 11",
    architectures: ["x64", "ARM64"],
    downloads: [
      {
        name: "NSIS Installer",
        description: "Recommended for most users",
        size: "~85 MB",
        format: ".exe",
        href: "https://github.com/JSB2010/DropSentinel/releases/latest/download/DropSentinel-Setup-1.0.0-x64.exe"
      },
      {
        name: "MSI Package",
        description: "For enterprise deployment",
        size: "~85 MB",
        format: ".msi",
        href: "https://github.com/JSB2010/DropSentinel/releases/latest/download/DropSentinel-Setup-1.0.0-x64.msi"
      },
      {
        name: "Portable",
        description: "No installation required",
        size: "~85 MB",
        format: ".exe",
        href: "https://github.com/JSB2010/DropSentinel/releases/latest/download/DropSentinel-Portable-1.0.0-x64.exe"
      }
    ]
  },
  {
    name: "macOS",
    icon: "🍎",
    version: "macOS 10.15+",
    architectures: ["Intel", "Apple Silicon"],
    downloads: [
      {
        name: "DMG Disk Image",
        description: "Recommended for most users",
        size: "~90 MB",
        format: ".dmg",
        href: "https://github.com/JSB2010/DropSentinel/releases/latest/download/DropSentinel-1.0.0-universal.dmg"
      },
      {
        name: "PKG Installer",
        description: "System-wide installation",
        size: "~90 MB",
        format: ".pkg",
        href: "https://github.com/JSB2010/DropSentinel/releases/latest/download/DropSentinel-1.0.0-universal.pkg"
      }
    ]
  },
  {
    name: "Linux",
    icon: "🐧",
    version: "Ubuntu 18.04+",
    architectures: ["x64", "ARM64"],
    downloads: [
      {
        name: "AppImage",
        description: "Universal Linux package",
        size: "~95 MB",
        format: ".AppImage",
        href: "https://github.com/JSB2010/DropSentinel/releases/latest/download/DropSentinel-1.0.0-x64.AppImage"
      },
      {
        name: "Debian Package",
        description: "For Debian/Ubuntu systems",
        size: "~85 MB",
        format: ".deb",
        href: "https://github.com/JSB2010/DropSentinel/releases/latest/download/DropSentinel-1.0.0-x64.deb"
      },
      {
        name: "RPM Package",
        description: "For RHEL/CentOS/Fedora",
        size: "~85 MB",
        format: ".rpm",
        href: "https://github.com/JSB2010/DropSentinel/releases/latest/download/DropSentinel-1.0.0-x64.rpm"
      }
    ]
  }
]

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background">
      <WebsiteHeader />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div variants={fadeInUp}>
                <Badge variant="outline" className="mb-4">
                  v1.0.0 Latest Release
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Download{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    DropSentinel
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Get started with advanced file security in minutes. Choose your platform below.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Download Options */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-12"
            >
              {platforms.map((platform, index) => (
                <motion.div key={platform.name} variants={fadeInUp}>
                  <Card className="overflow-hidden border-2 hover:border-primary/20 transition-all duration-300">
                    <CardHeader className="bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{platform.icon}</div>
                        <div>
                          <CardTitle className="text-2xl">{platform.name}</CardTitle>
                          <p className="text-muted-foreground">
                            {platform.version} • {platform.architectures.join(", ")}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {platform.downloads.map((download) => (
                          <div key={download.name} className="border border-border/50 rounded-lg p-4 hover:bg-muted/30 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">{download.name}</h4>
                                <p className="text-sm text-muted-foreground">{download.description}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {download.format}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{download.size}</span>
                              <Button size="sm" asChild>
                                <Link href={download.href} target="_blank">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Additional Options */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Alternative Download Methods</h2>
                <p className="text-muted-foreground">
                  Additional ways to get DropSentinel for advanced users and developers
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                <motion.div variants={fadeInUp}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <GitBranch className="w-8 h-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">GitHub Releases</h3>
                          <p className="text-sm text-muted-foreground">All versions and checksums</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Access all releases, pre-releases, and verify file integrity with SHA256 checksums.
                      </p>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="https://github.com/JSB2010/DropSentinel/releases" target="_blank">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View All Releases
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Package className="w-8 h-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">Build from Source</h3>
                          <p className="text-sm text-muted-foreground">Compile yourself</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Clone the repository and build DropSentinel yourself for maximum security and customization.
                      </p>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="https://github.com/JSB2010/DropSentinel#building-for-production" target="_blank">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Build Instructions
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* System Requirements */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">System Requirements</h2>
                <p className="text-muted-foreground">
                  Minimum requirements to run DropSentinel on your system
                </p>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Monitor,
                      title: "Operating System",
                      requirements: [
                        "Windows 10 (1903) or later",
                        "macOS 10.15 (Catalina) or later",
                        "Ubuntu 18.04 LTS or equivalent"
                      ]
                    },
                    {
                      icon: HardDrive,
                      title: "Hardware",
                      requirements: [
                        "4 GB RAM minimum",
                        "200 MB free disk space",
                        "x64 or ARM64 processor"
                      ]
                    },
                    {
                      icon: Shield,
                      title: "Additional",
                      requirements: [
                        "Internet connection required",
                        "VirusTotal API key (free)",
                        "Administrator privileges for installation"
                      ]
                    }
                  ].map((req) => {
                    const IconComponent = req.icon
                    return (
                      <Card key={req.title}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <IconComponent className="w-6 h-6 text-primary" />
                            <h3 className="font-semibold">{req.title}</h3>
                          </div>
                          <ul className="space-y-2">
                            {req.requirements.map((requirement, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {requirement}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Security Notice */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="max-w-3xl mx-auto"
            >
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Security Notice:</strong> Always download DropSentinel from official sources.
                  Verify file integrity using the provided SHA256 checksums on our GitHub releases page.
                  Windows users may see a SmartScreen warning - this is normal for new applications and will disappear as our reputation builds.
                </AlertDescription>
              </Alert>
            </motion.div>
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  )
}
