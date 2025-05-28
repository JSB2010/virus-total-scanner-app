"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  FolderOpen, 
  Settings, 
  History, 
  Shield, 
  Zap,
  FileText,
  Search,
  Download,
  Trash2,
  RefreshCw,
  Eye
} from "lucide-react"

interface QuickActionsProps {
  onManualScan: () => void
  onSettings: () => void
  onScanHistory: () => void
  onRefresh: () => void
  stats: {
    totalScans: number
    threatsDetected: number
    lastScan: string | null
  }
}

export function QuickActions({ 
  onManualScan, 
  onSettings, 
  onScanHistory, 
  onRefresh,
  stats 
}: Readonly<QuickActionsProps>) {
  const quickActions = [
    {
      title: "Quick Scan",
      description: "Scan individual files or folders",
      icon: Upload,
      action: onManualScan,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-700 dark:text-blue-300",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Scan History",
      description: "View detailed scan results",
      icon: History,
      action: onScanHistory,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-700 dark:text-purple-300",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Settings",
      description: "Configure security preferences",
      icon: Settings,
      action: onSettings,
      color: "from-slate-500 to-slate-600",
      bgColor: "bg-slate-50 dark:bg-slate-900/20",
      textColor: "text-slate-700 dark:text-slate-300",
      iconColor: "text-slate-600 dark:text-slate-400"
    },
    {
      title: "Refresh Data",
      description: "Update scan statistics",
      icon: RefreshCw,
      action: onRefresh,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-700 dark:text-green-300",
      iconColor: "text-green-600 dark:text-green-400"
    }
  ]

  const securityFeatures = [
    {
      title: "Real-time Protection",
      description: "Continuous file monitoring",
      icon: Eye,
      status: "active"
    },
    {
      title: "VirusTotal Integration",
      description: "70+ antivirus engines",
      icon: Shield,
      status: "active"
    },
    {
      title: "Smart Scanning",
      description: "AI-powered threat detection",
      icon: Zap,
      status: "active"
    },
    {
      title: "Secure Quarantine",
      description: "Isolated threat storage",
      icon: Trash2,
      status: "coming-soon"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <Card className="glass border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Frequently used security tools and functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Button
                    onClick={action.action}
                    variant="outline"
                    className={`w-full h-auto p-4 ${action.bgColor} border-white/20 hover:shadow-lg transition-all duration-200 hover-lift`}
                  >
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className={`p-3 rounded-xl bg-white/50 dark:bg-slate-800/50`}>
                        <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                      </div>
                      <div>
                        <div className={`font-medium ${action.textColor}`}>
                          {action.title}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Features Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        <Card className="glass border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Security Features
            </CardTitle>
            <CardDescription>
              Advanced protection capabilities and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/20"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <feature.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {feature.title}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </div>
                  </div>
                  <Badge 
                    variant={feature.status === 'active' ? 'default' : 'secondary'}
                    className={feature.status === 'active' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-orange-100 text-orange-800 border-orange-200'
                    }
                  >
                    {feature.status === 'active' ? 'Active' : 'Coming Soon'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        <Card className="glass border-0 shadow-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                  Today's Security Summary
                </h3>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-indigo-700 dark:text-indigo-300">
                      {stats.totalScans} files scanned
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-indigo-700 dark:text-indigo-300">
                      {stats.threatsDetected} threats detected
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  {stats.totalScans > 0 ? Math.round(((stats.totalScans - stats.threatsDetected) / stats.totalScans) * 100) : 100}%
                </div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400">
                  Clean Rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
