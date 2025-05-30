'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle,
  Download,
  Github,
  Shield,
  Sparkles,
  Star
} from 'lucide-react'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut", delay: 0.2 }
}

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut", delay: 0.4 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const floatingAnimation = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                v1.0.0 Now Available
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Advanced File
              </span>
              <br />
              <span className="text-foreground">Security Scanner</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Real-time protection with <span className="font-semibold text-blue-600">VirusTotal integration</span>.
              Monitor downloads, detect threats, and keep your system secure with ultra-modern design.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Link href="/download">
                  <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Download Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 hover:bg-muted/50 group"
              >
                <Link href="https://github.com/JSB2010/virus-total-scanner-app" target="_blank">
                  <Github className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  View on GitHub
                  <Star className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
            >
              {[
                "✓ Real-time Monitoring",
                "✓ VirusTotal Integration",
                "✓ Cross-Platform Support",
                "✓ Open Source & Free"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {feature.replace('✓ ', '')}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - App Preview */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInRight}
            className="relative"
          >
            <motion.div
              variants={floatingAnimation}
              className="relative"
            >
              {/* Real App Preview */}
              <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-border/50">
                <div className="aspect-[4/3] p-4">
                  {/* Real App Interface */}
                  <div className="h-full bg-background rounded-xl border border-border/50 shadow-inner overflow-hidden">
                    {/* Header */}
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-t-xl blur-xl"></div>
                      <div className="relative glass rounded-t-xl p-4 border-b border-white/30 shadow-lg backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                <Shield className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <div>
                              <h1 className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                DropSentinel
                              </h1>
                              <p className="text-xs text-muted-foreground">Advanced Security Scanner</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                              Protected
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-2 border border-blue-200/50 dark:border-blue-800/50">
                          <div className="text-lg font-bold text-blue-600">0</div>
                          <div className="text-xs text-muted-foreground">Threats</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-2 border border-green-200/50 dark:border-green-800/50">
                          <div className="text-lg font-bold text-green-600">1,247</div>
                          <div className="text-xs text-muted-foreground">Scanned</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-2 border border-purple-200/50 dark:border-purple-800/50">
                          <div className="text-lg font-bold text-purple-600">24/7</div>
                          <div className="text-xs text-muted-foreground">Active</div>
                        </div>
                      </div>

                      {/* Recent Scans */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground">Recent Scans</h3>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs bg-muted/30 rounded p-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="truncate">document.pdf</span>
                            </div>
                            <span className="text-green-600 font-medium">Clean</span>
                          </div>
                          <div className="flex items-center justify-between text-xs bg-muted/30 rounded p-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="truncate">installer.exe</span>
                            </div>
                            <span className="text-green-600 font-medium">Clean</span>
                          </div>
                        </div>
                      </div>

                      {/* Monitoring Status */}
                      <div className="flex items-center justify-between text-xs">
                        <span>Real-time Monitoring</span>
                        <div className="w-6 h-3 bg-green-500 rounded-full relative">
                          <div className="w-2 h-2 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>

              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
              >
                ✓ Secure
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
