'use client'

import { motion } from 'framer-motion'
import { 
  Shield, 
  Eye, 
  Zap, 
  BarChart3, 
  Lock, 
  Bell,
  Palette,
  Globe,
  Settings,
  Download,
  FileSearch,
  Activity
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

const features = [
  {
    icon: Shield,
    title: "Real-time Protection",
    description: "Continuous monitoring of your Downloads folder and custom locations with instant threat detection.",
    color: "from-blue-500 to-blue-600",
    highlight: "Core Feature"
  },
  {
    icon: Eye,
    title: "VirusTotal Integration",
    description: "Leverage 70+ antivirus engines through VirusTotal's comprehensive threat intelligence database.",
    color: "from-purple-500 to-purple-600",
    highlight: "Powered by VirusTotal"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built with Next.js and optimized for performance. Minimal system resource usage with maximum protection.",
    color: "from-yellow-500 to-orange-500",
    highlight: "High Performance"
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Comprehensive scan history, threat analytics, and detailed reports with visual charts and insights.",
    color: "from-green-500 to-emerald-600",
    highlight: "Analytics"
  },
  {
    icon: Lock,
    title: "Quarantine Management",
    description: "Safe isolation and management of detected threats with easy restoration options for false positives.",
    color: "from-red-500 to-pink-600",
    highlight: "Security"
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Native system notifications for scan results with customizable alert preferences and priority levels.",
    color: "from-indigo-500 to-purple-600",
    highlight: "Notifications"
  },
  {
    icon: Palette,
    title: "Modern UI/UX",
    description: "Ultra-modern, responsive design with dark/light mode support and smooth animations throughout.",
    color: "from-pink-500 to-rose-600",
    highlight: "Design"
  },
  {
    icon: Globe,
    title: "Cross-Platform",
    description: "Native support for Windows, macOS, and Linux with platform-specific optimizations and features.",
    color: "from-cyan-500 to-blue-600",
    highlight: "Universal"
  },
  {
    icon: Settings,
    title: "Customizable Settings",
    description: "Flexible configuration options for scan locations, notification preferences, and security policies.",
    color: "from-gray-500 to-slate-600",
    highlight: "Configurable"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
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
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Complete Protection
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              DropSentinel combines cutting-edge security technology with an intuitive user experience 
              to provide comprehensive file protection for modern users.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card className="h-full group hover:shadow-xl transition-all duration-500 border-2 hover:border-primary/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="mb-4 relative">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 text-xs bg-background border border-border/50"
                      >
                        {feature.highlight}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Additional Feature Highlights */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-20"
        >
          <motion.div variants={fadeInUp}>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-800/50">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
                    <FileSearch className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold">Drag & Drop Scanning</h4>
                  <p className="text-sm text-muted-foreground">
                    Simply drag files onto the app for instant security analysis
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold">Background Monitoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Runs silently in the background with minimal resource usage
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold">Auto-Scan Downloads</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically scans new downloads for immediate protection
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
