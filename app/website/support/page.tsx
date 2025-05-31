'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WebsiteFooter } from '@/components/website/footer'
import { WebsiteHeader } from '@/components/website/header'
import { motion } from 'framer-motion'
import {
  Book,
  Bug,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  Users
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

export default function SupportPage() {
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
                  Support
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  We're Here to{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Help
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Get the support you need to make the most of DropSentinel's security features.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Support Options */}
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
                <h2 className="text-3xl font-bold mb-4">How Can We Help?</h2>
                <p className="text-muted-foreground">
                  Choose the best way to get the support you need
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    icon: Book,
                    title: "Documentation",
                    description: "Comprehensive guides and tutorials to help you get started and make the most of DropSentinel.",
                    action: "Read Docs",
                    href: "/website/docs",
                    color: "from-blue-500 to-blue-600"
                  },
                  {
                    icon: Bug,
                    title: "Report a Bug",
                    description: "Found an issue? Report it on GitHub and our team will investigate and fix it promptly.",
                    action: "Report Issue",
                    href: "https://github.com/JSB2010/DropSentinel/issues/new?template=bug_report.yml",
                    external: true,
                    color: "from-red-500 to-red-600"
                  },
                  {
                    icon: Lightbulb,
                    title: "Feature Request",
                    description: "Have an idea for a new feature? We'd love to hear your suggestions for improving DropSentinel.",
                    action: "Suggest Feature",
                    href: "https://github.com/JSB2010/DropSentinel/issues/new?template=feature_request.yml",
                    external: true,
                    color: "from-yellow-500 to-orange-500"
                  },
                  {
                    icon: Users,
                    title: "Community Discussions",
                    description: "Join our community to ask questions, share tips, and connect with other DropSentinel users.",
                    action: "Join Discussion",
                    href: "https://github.com/JSB2010/DropSentinel/discussions",
                    external: true,
                    color: "from-purple-500 to-purple-600"
                  }
                ].map((option, index) => {
                  const IconComponent = option.icon
                  return (
                    <motion.div key={option.title} variants={fadeInUp}>
                      <Card className="h-full group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <CardTitle>{option.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-6">{option.description}</p>
                          <Button asChild className="w-full">
                            <Link href={option.href} target={option.external ? '_blank' : undefined}>
                              {option.action}
                              {option.external && <ExternalLink className="w-4 h-4 ml-2" />}
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
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
                <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">
                  Quick answers to common questions about DropSentinel
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-6">
                {[
                  {
                    question: "Is DropSentinel really free?",
                    answer: "Yes! DropSentinel is completely free and open source. There are no hidden costs, premium features, or subscriptions. You can use all features without any limitations."
                  },
                  {
                    question: "Do I need a VirusTotal API key?",
                    answer: "Yes, you'll need a free VirusTotal API key to use the scanning features. You can sign up for free at virustotal.com and get 4 requests per minute, which is perfect for personal use."
                  },
                  {
                    question: "How much system resources does DropSentinel use?",
                    answer: "DropSentinel is designed to be lightweight. It typically uses less than 50MB of RAM and minimal CPU when running in the background. File monitoring has negligible impact on system performance."
                  },
                  {
                    question: "Can I trust DropSentinel with my files?",
                    answer: "Absolutely. DropSentinel is open source, so you can review the entire codebase. We don't collect any personal data, and all file analysis is done through VirusTotal's secure API."
                  },
                  {
                    question: "What happens if a file is falsely flagged?",
                    answer: "If a file is incorrectly identified as malicious, you can easily restore it from quarantine. DropSentinel also allows you to whitelist files to prevent future false positives."
                  },
                  {
                    question: "Does DropSentinel work offline?",
                    answer: "DropSentinel requires an internet connection to scan files through VirusTotal's API. However, it can still monitor files offline and queue scans for when connectivity is restored."
                  }
                ].map((faq, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.div variants={fadeInUp}>
                <h2 className="text-3xl font-bold mb-4">Additional Resources</h2>
                <p className="text-muted-foreground mb-8">
                  Explore more resources to get the most out of DropSentinel
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <GitBranch className="w-12 h-12 mx-auto mb-4 text-primary" />
                      <h3 className="font-semibold mb-2">Open Source</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        DropSentinel is completely open source. Review the code, contribute, or fork the project.
                      </p>
                      <Button variant="outline" asChild>
                        <Link href="https://github.com/JSB2010/DropSentinel" target="_blank">
                          View Repository
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <Book className="w-12 h-12 mx-auto mb-4 text-primary" />
                      <h3 className="font-semibold mb-2">Documentation</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Comprehensive guides and tutorials to help you master DropSentinel's features.
                      </p>
                      <Button variant="outline" asChild>
                        <Link href="/website/docs">
                          Read Documentation
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
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
