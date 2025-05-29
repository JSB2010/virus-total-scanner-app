'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CTASection } from '@/components/website/cta-section'
import { FeaturesSection } from '@/components/website/features-section'
import { WebsiteFooter } from '@/components/website/footer'
import { WebsiteHeader } from '@/components/website/header'
import { HeroSection } from '@/components/website/hero-section'
import { motion } from 'framer-motion'
import {
  CheckCircle
} from 'lucide-react'

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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <WebsiteHeader />

      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Platform Support Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.div variants={fadeInUp}>
                <Badge variant="outline" className="mb-4">
                  Cross-Platform
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Works on Every Platform
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Native support for Windows, macOS, and Linux with platform-specific optimizations
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                {
                  platform: "Windows",
                  icon: "🪟",
                  versions: "Windows 10, 11",
                  architectures: "x64, ARM64",
                  formats: ["NSIS Installer", "MSI Package", "Portable EXE"]
                },
                {
                  platform: "macOS",
                  icon: "🍎",
                  versions: "macOS 10.15+",
                  architectures: "Intel, Apple Silicon",
                  formats: ["DMG Disk Image", "PKG Installer", "ZIP Archive"]
                },
                {
                  platform: "Linux",
                  icon: "🐧",
                  versions: "Ubuntu, Debian, RHEL",
                  architectures: "x64, ARM64",
                  formats: ["AppImage", "DEB Package", "RPM Package"]
                }
              ].map((platform, index) => (
                <motion.div key={platform.platform} variants={fadeInUp}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                    <CardContent className="p-6">
                      <div className="text-4xl mb-4">{platform.icon}</div>
                      <h3 className="text-xl font-semibold mb-2">{platform.platform}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{platform.versions}</p>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Architectures:</span> {platform.architectures}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Formats:</span>
                          <ul className="mt-1 space-y-1">
                            {platform.formats.map((format) => (
                              <li key={format} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {format}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <CTASection />
      </main>

      <WebsiteFooter />
    </div>
  )
}
