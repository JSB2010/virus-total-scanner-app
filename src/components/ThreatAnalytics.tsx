"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Globe,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Eye,
  Target
} from "lucide-react"

interface ThreatAnalyticsProps {
  threatData: {
    totalThreats: number
    threatTrends: Array<{
      date: string
      count: number
    }>
    threatTypes: Array<{
      type: string
      count: number
      percentage: number
    }>
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    lastUpdate: string
  }
}

export function ThreatAnalytics({ threatData }: Readonly<ThreatAnalyticsProps>) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <Shield className="w-4 h-4" />
      case 'medium': return <Eye className="w-4 h-4" />
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <Target className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  const getTrendIcon = () => {
    const recent = threatData.threatTrends.slice(-2)
    if (recent.length < 2) return <Activity className="w-4 h-4" />
    
    const trend = recent[1].count - recent[0].count
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-red-500" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-green-500" />
    return <Activity className="w-4 h-4 text-blue-500" />
  }

  const mockThreatIntelligence = [
    {
      title: "Emerging Malware Families",
      description: "New variants detected in the last 24 hours",
      count: 3,
      severity: "high",
      icon: Zap
    },
    {
      title: "Phishing Campaigns",
      description: "Active campaigns targeting users",
      count: 7,
      severity: "medium",
      icon: Globe
    },
    {
      title: "Suspicious Downloads",
      description: "Files flagged for review",
      count: 12,
      severity: "low",
      icon: AlertTriangle
    }
  ]

  return (
    <div className="space-y-6">
      {/* Threat Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              Threat Analytics
            </CardTitle>
            <CardDescription>
              Real-time threat intelligence and security insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Risk Level */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Current Risk Level</h3>
                <div className={`p-4 rounded-xl border ${getRiskColor(threatData.riskLevel)}`}>
                  <div className="flex items-center gap-3">
                    {getRiskIcon(threatData.riskLevel)}
                    <div>
                      <div className="font-semibold capitalize">{threatData.riskLevel} Risk</div>
                      <div className="text-sm opacity-80">System Status</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Threat Count */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Total Threats</h3>
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <div>
                      <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {threatData.totalThreats}
                      </div>
                      <div className="text-sm text-red-700 dark:text-red-300">Detected</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Trend Analysis</h3>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    {getTrendIcon()}
                    <div>
                      <div className="font-semibold text-blue-900 dark:text-blue-100">
                        {threatData.threatTrends.length > 1 ? 'Trending' : 'Stable'}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Last 7 days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Threat Types Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Threat Categories
            </CardTitle>
            <CardDescription>
              Distribution of detected threat types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {threatData.threatTypes.map((threat, index) => (
                <motion.div
                  key={threat.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {threat.type}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {threat.count} instances
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <Progress value={threat.percentage} className="h-2" />
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 w-12 text-right">
                      {threat.percentage}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Threat Intelligence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="glass border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Threat Intelligence
            </CardTitle>
            <CardDescription>
              Latest security insights and emerging threats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockThreatIntelligence.map((intel, index) => (
                <motion.div
                  key={intel.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/20"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      intel.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                      intel.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <intel.icon className={`w-4 h-4 ${
                        intel.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                        intel.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                        {intel.title}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {intel.description}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            intel.severity === 'high' ? 'border-red-200 text-red-700' :
                            intel.severity === 'medium' ? 'border-yellow-200 text-yellow-700' :
                            'border-blue-200 text-blue-700'
                          }`}
                        >
                          {intel.severity.toUpperCase()}
                        </Badge>
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {intel.count}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Last updated: {new Date(threatData.lastUpdate).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
