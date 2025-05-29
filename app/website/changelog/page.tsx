'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Plus, Bug, Zap, Shield } from 'lucide-react'
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

const releases = [
  {
    version: "1.0.0",
    date: "2024-01-15",
    type: "major",
    description: "Initial release of DropSentinel with comprehensive file security features",
    changes: [
      {
        type: "feature",
        icon: Plus,
        title: "Real-time File Monitoring",
        description: "Automatic detection and scanning of new files in Downloads folder"
      },
      {
        type: "feature", 
        icon: Shield,
        title: "VirusTotal Integration",
        description: "Complete integration with VirusTotal API for comprehensive threat analysis"
      },
      {
        type: "feature",
        icon: Zap,
        title: "Modern UI/UX",
        description: "Ultra-modern, responsive interface with dark/light mode support"
      },
      {
        type: "feature",
        icon: CheckCircle,
        title: "Cross-Platform Support",
        description: "Native support for Windows, macOS, and Linux platforms"
      },
      {
        type: "feature",
        icon: Shield,
        title: "Quarantine Management",
        description: "Safe isolation and management of detected threats"
      },
      {
        type: "feature",
        icon: Plus,
        title: "Scan History & Analytics",
        description: "Comprehensive scan history with detailed analytics and reporting"
      }
    ]
  }
]

export default function ChangelogPage() {
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
                  Release History
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Changelog
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Track the evolution of DropSentinel with detailed release notes and feature updates.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Releases */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-4xl mx-auto space-y-12"
            >
              {releases.map((release) => (
                <motion.div key={release.version} variants={fadeInUp}>
                  <Card className="overflow-hidden border-2 hover:border-primary/20 transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <Badge 
                            className={`text-sm px-3 py-1 ${
                              release.type === 'major' 
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
                                : release.type === 'minor'
                                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                : 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                            }`}
                          >
                            v{release.version}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Released {new Date(release.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {release.type} Release
                        </Badge>
                      </div>

                      <p className="text-muted-foreground mb-8 text-lg">
                        {release.description}
                      </p>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-4">What's New</h3>
                        <div className="grid gap-4">
                          {release.changes.map((change, index) => {
                            const IconComponent = change.icon
                            return (
                              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  change.type === 'feature' 
                                    ? 'bg-green-500/10 text-green-600' 
                                    : change.type === 'improvement'
                                    ? 'bg-blue-500/10 text-blue-600'
                                    : 'bg-orange-500/10 text-orange-600'
                                }`}>
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium mb-1">{change.title}</h4>
                                  <p className="text-sm text-muted-foreground">{change.description}</p>
                                </div>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {change.type}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Future Releases */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.div variants={fadeInUp}>
                <h2 className="text-3xl font-bold mb-4">What's Coming Next?</h2>
                <p className="text-muted-foreground mb-8">
                  We're constantly working to improve DropSentinel. Here's what's planned for future releases:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Enhanced Reporting",
                      description: "More detailed analytics and exportable security reports",
                      version: "1.1.0"
                    },
                    {
                      title: "Custom Scan Locations",
                      description: "Monitor multiple folders and custom file types",
                      version: "1.1.0"
                    },
                    {
                      title: "Scheduled Scanning",
                      description: "Automated periodic scans of your entire system",
                      version: "1.2.0"
                    },
                    {
                      title: "Team Management",
                      description: "Multi-user support for enterprise environments",
                      version: "2.0.0"
                    }
                  ].map((feature, index) => (
                    <Card key={index} className="text-left">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{feature.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            v{feature.version}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
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
