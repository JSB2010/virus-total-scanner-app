'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

export default function TermsPage() {
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
                  Terms of Service
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Terms of{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Service
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Simple, fair terms for using DropSentinel security software.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16">
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
                    <h2>Terms of Service</h2>
                    <p className="text-muted-foreground">Last updated: January 15, 2024</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>
                      By downloading, installing, or using DropSentinel, you agree to be bound by these Terms of Service.
                      If you do not agree to these terms, do not use the software.
                    </p>

                    <h3>2. License</h3>
                    <p>
                      DropSentinel is open source software licensed under the MIT License. You are free to:
                    </p>
                    <ul>
                      <li>Use the software for any purpose</li>
                      <li>Study and modify the source code</li>
                      <li>Distribute copies of the software</li>
                      <li>Distribute modified versions</li>
                    </ul>

                    <h3>3. Disclaimer of Warranties</h3>
                    <p>
                      DropSentinel is provided "as is" without warranty of any kind. We make no guarantees about:
                    </p>
                    <ul>
                      <li>The software's ability to detect all threats</li>
                      <li>Uninterrupted or error-free operation</li>
                      <li>Compatibility with all systems</li>
                      <li>Protection against all security threats</li>
                    </ul>

                    <h3>4. Limitation of Liability</h3>
                    <p>
                      In no event shall the developers of DropSentinel be liable for any damages arising from the use or inability to use the software, including but not limited to:
                    </p>
                    <ul>
                      <li>Data loss or corruption</li>
                      <li>System damage or malfunction</li>
                      <li>Security breaches or malware infections</li>
                      <li>Business interruption or financial loss</li>
                    </ul>

                    <h3>5. User Responsibilities</h3>
                    <p>
                      As a user of DropSentinel, you are responsible for:
                    </p>
                    <ul>
                      <li>Obtaining and managing your own VirusTotal API key</li>
                      <li>Keeping the software updated</li>
                      <li>Using the software in compliance with applicable laws</li>
                      <li>Maintaining backups of important data</li>
                      <li>Not using the software for illegal activities</li>
                    </ul>

                    <h3>6. Third-Party Services</h3>
                    <p>
                      DropSentinel integrates with VirusTotal for threat analysis. Your use of VirusTotal is subject to their terms of service and privacy policy. We are not responsible for VirusTotal's service availability or policies.
                    </p>

                    <h3>7. Modifications to Terms</h3>
                    <p>
                      We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the software after changes constitutes acceptance of the new terms.
                    </p>

                    <h3>8. Open Source Nature</h3>
                    <p>
                      DropSentinel is open source software. The source code is available on GitHub, and you are encouraged to review, contribute to, and modify the software according to the MIT License terms.
                    </p>

                    <h3>9. Termination</h3>
                    <p>
                      You may stop using DropSentinel at any time by uninstalling the software. These terms will remain in effect until terminated.
                    </p>

                    <h3>10. Governing Law</h3>
                    <p>
                      These terms are governed by the laws of the jurisdiction where the software is used. Any disputes will be resolved in accordance with applicable local laws.
                    </p>

                    <h3>11. Contact Information</h3>
                    <p>
                      For questions about these terms, please open an issue on our GitHub repository at:{' '}
                      <a href="https://github.com/JSB2010/virus-total-scanner-app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        https://github.com/JSB2010/virus-total-scanner-app
                      </a>
                    </p>

                    <h3>12. Entire Agreement</h3>
                    <p>
                      These terms constitute the entire agreement between you and the developers of DropSentinel regarding the use of the software.
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
