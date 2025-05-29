'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Eye, Database, Lock } from 'lucide-react'
import { WebsiteHeader } from '@/components/website/header'
import { WebsiteFooter } from '@/components/website/footer'

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

export default function PrivacyPage() {
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
                  Privacy Policy
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Your Privacy is{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Protected
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  DropSentinel is designed with privacy-first principles. Learn how we protect your data.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Privacy Highlights */}
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
                <h2 className="text-3xl font-bold mb-4">Privacy at a Glance</h2>
                <p className="text-muted-foreground">
                  Key principles that guide how DropSentinel handles your data
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: Eye,
                    title: "No Data Collection",
                    description: "We don't collect, store, or transmit your personal data"
                  },
                  {
                    icon: Database,
                    title: "Local Processing",
                    description: "All file analysis happens locally on your device"
                  },
                  {
                    icon: Shield,
                    title: "Secure API Calls",
                    description: "Only file hashes are sent to VirusTotal, never file contents"
                  },
                  {
                    icon: Lock,
                    title: "Open Source",
                    description: "Transparent code that you can review and audit"
                  }
                ].map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <motion.div key={item.title} variants={fadeInUp}>
                      <Card className="h-full text-center">
                        <CardContent className="p-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Detailed Policy */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
                    <h2>Privacy Policy</h2>
                    <p className="text-muted-foreground">Last updated: January 15, 2024</p>

                    <h3>1. Information We Don't Collect</h3>
                    <p>
                      DropSentinel is designed with privacy-first principles. We do not collect, store, or transmit any personal information, including:
                    </p>
                    <ul>
                      <li>Personal identification information</li>
                      <li>File contents or file names</li>
                      <li>Usage analytics or telemetry</li>
                      <li>System information or hardware details</li>
                      <li>Network activity or browsing history</li>
                    </ul>

                    <h3>2. How DropSentinel Works</h3>
                    <p>
                      DropSentinel operates entirely on your local device. When scanning files:
                    </p>
                    <ul>
                      <li>Files are analyzed locally using cryptographic hashes</li>
                      <li>Only SHA256 hashes (not file contents) are sent to VirusTotal</li>
                      <li>Scan results are stored locally on your device</li>
                      <li>No file contents ever leave your device</li>
                    </ul>

                    <h3>3. Third-Party Services</h3>
                    <p>
                      DropSentinel integrates with VirusTotal for threat analysis:
                    </p>
                    <ul>
                      <li>Only file hashes are transmitted to VirusTotal</li>
                      <li>VirusTotal's privacy policy applies to their service</li>
                      <li>You control your VirusTotal API key and usage</li>
                      <li>No other third-party services are used</li>
                    </ul>

                    <h3>4. Data Storage</h3>
                    <p>
                      All data is stored locally on your device:
                    </p>
                    <ul>
                      <li>Scan history and results</li>
                      <li>Application settings and preferences</li>
                      <li>Quarantined files (if any)</li>
                      <li>No cloud storage or remote databases</li>
                    </ul>

                    <h3>5. Open Source Transparency</h3>
                    <p>
                      DropSentinel is open source software:
                    </p>
                    <ul>
                      <li>Source code is publicly available on GitHub</li>
                      <li>You can review, audit, and modify the code</li>
                      <li>Community contributions are welcome</li>
                      <li>No hidden functionality or backdoors</li>
                    </ul>

                    <h3>6. Updates to This Policy</h3>
                    <p>
                      We may update this privacy policy from time to time. Any changes will be reflected in the "Last updated" date above and communicated through our GitHub repository.
                    </p>

                    <h3>7. Contact</h3>
                    <p>
                      If you have questions about this privacy policy, please open an issue on our GitHub repository.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <WebsiteFooter />
    </div>
  )
}
