'use client'

import { motion } from 'framer-motion'
import { 
  Book, 
  Download, 
  Settings, 
  Shield, 
  Play,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
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

export default function DocsPage() {
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
                  Documentation
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Get Started with{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    DropSentinel
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Everything you need to know to set up and use DropSentinel for maximum protection.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Quick Start */}
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
                <h2 className="text-3xl font-bold mb-4">Quick Start Guide</h2>
                <p className="text-muted-foreground">
                  Get DropSentinel up and running in just a few minutes
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: "1",
                    icon: Download,
                    title: "Download & Install",
                    description: "Download DropSentinel for your platform and run the installer.",
                    details: [
                      "Choose your platform (Windows, macOS, Linux)",
                      "Download the appropriate installer",
                      "Run with administrator privileges",
                      "Follow the installation wizard"
                    ]
                  },
                  {
                    step: "2", 
                    icon: Settings,
                    title: "Configure API Key",
                    description: "Set up your free VirusTotal API key for threat detection.",
                    details: [
                      "Sign up at virustotal.com (free)",
                      "Generate your API key",
                      "Enter it in DropSentinel setup",
                      "Test the connection"
                    ]
                  },
                  {
                    step: "3",
                    icon: Shield,
                    title: "Start Protection",
                    description: "Enable real-time monitoring and start scanning files.",
                    details: [
                      "Enable background monitoring",
                      "Configure scan locations",
                      "Set notification preferences",
                      "You're protected!"
                    ]
                  }
                ].map((step, index) => {
                  const IconComponent = step.icon
                  return (
                    <motion.div key={step.step} variants={fadeInUp}>
                      <Card className="h-full">
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {step.step}
                            </div>
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                          <CardTitle>{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">{step.description}</p>
                          <ul className="space-y-2">
                            {step.details.map((detail, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Guide */}
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
                <h2 className="text-3xl font-bold mb-4">Key Features</h2>
                <p className="text-muted-foreground">
                  Learn how to make the most of DropSentinel's powerful features
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-8">
                {[
                  {
                    title: "Real-time File Monitoring",
                    description: "DropSentinel automatically monitors your Downloads folder and other specified locations for new files.",
                    features: [
                      "Automatic detection of new files",
                      "Configurable monitoring locations",
                      "Background operation with minimal resource usage",
                      "Instant notifications for detected files"
                    ]
                  },
                  {
                    title: "VirusTotal Integration",
                    description: "Leverage the power of 70+ antivirus engines through VirusTotal's comprehensive database.",
                    features: [
                      "Free API with 4 requests per minute",
                      "Comprehensive threat analysis",
                      "Detailed scan reports with engine results",
                      "Direct links to VirusTotal for more information"
                    ]
                  },
                  {
                    title: "Quarantine Management",
                    description: "Safely isolate suspicious files while maintaining the ability to restore false positives.",
                    features: [
                      "Secure file isolation",
                      "Easy restoration of quarantined files",
                      "Detailed quarantine logs",
                      "Automatic cleanup options"
                    ]
                  },
                  {
                    title: "Scan History & Analytics",
                    description: "Track your security posture with detailed analytics and comprehensive scan history.",
                    features: [
                      "Complete scan history with timestamps",
                      "Visual analytics and charts",
                      "Threat trend analysis",
                      "Exportable reports"
                    ]
                  }
                ].map((feature, index) => (
                  <Card key={feature.title}>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <div className="grid md:grid-cols-2 gap-2">
                        {feature.features.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Troubleshooting */}
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
                <h2 className="text-3xl font-bold mb-4">Troubleshooting</h2>
                <p className="text-muted-foreground">
                  Common issues and their solutions
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Windows SmartScreen Warning:</strong> Windows may show a warning when first installing DropSentinel. 
                    This is normal for new applications. Click "More info" then "Run anyway" to proceed with installation.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>API Rate Limits:</strong> The free VirusTotal API allows 4 requests per minute. 
                    If you exceed this limit, scans will be queued automatically.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>False Positives:</strong> If a file is incorrectly flagged as malicious, 
                    you can restore it from quarantine and add it to your whitelist.
                  </AlertDescription>
                </Alert>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-12 text-center">
                <h3 className="text-xl font-semibold mb-4">Need More Help?</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="https://github.com/JSB2010/virus-total-scanner-app/issues" target="_blank">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Report an Issue
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="https://github.com/JSB2010/virus-total-scanner-app/discussions" target="_blank">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Community Discussions
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <WebsiteFooter />
    </div>
  )
}
