"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Globe,
  Clock,
  FileText,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  FolderOpen
} from "lucide-react"

interface ScanResultDialogProps {
  open: boolean
  onClose: () => void
  result: {
    fileName: string
    status: 'clean' | 'threat' | 'error'
    positives: number
    total: number
    scanId?: string
    permalink?: string
    scanDate?: string
    filePath?: string
    fileSize?: string
    scanDuration?: string
    detections?: any[]
    engineStats?: {
      clean: number
      threats: number
      total: number
    }
    error?: string
  } | null
  onQuarantine?: () => void
}

export function ScanResultDialog({ open, onClose, result, onQuarantine }: Readonly<ScanResultDialogProps>) {
  const [activeTab, setActiveTab] = useState("overview")
  const [showDetailedDetections, setShowDetailedDetections] = useState(false)

  if (!result) return null

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'clean':
        return {
          icon: CheckCircle2,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800',
          title: 'File is Clean',
          description: 'No threats detected by any security engine',
          gradient: 'from-green-500 to-emerald-600'
        }
      case 'threat':
        return {
          icon: XCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-800',
          title: 'Threats Detected!',
          description: 'Malicious content found - immediate action required',
          gradient: 'from-red-500 to-pink-600'
        }
      default:
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          title: 'Scan Error',
          description: 'Unable to complete the security scan',
          gradient: 'from-yellow-500 to-orange-600'
        }
    }
  }

  const statusConfig = getStatusConfig(result.status)
  const StatusIcon = statusConfig.icon

  // Calculate percentages for pie chart visualization
  const cleanPercentage = result.total > 0 ? Math.round(((result.total - result.positives) / result.total) * 100) : 0
  const threatPercentage = result.total > 0 ? Math.round((result.positives / result.total) * 100) : 0

  const handleViewOnVirusTotal = () => {
    if (result.permalink) {
      // Try electron API first, fallback to window.open
      if (window.electronAPI?.openExternal) {
        window.electronAPI.openExternal(result.permalink)
      } else {
        window.open(result.permalink, '_blank')
      }
    }
  }

  const handleShowInFolder = () => {
    if (result.filePath) {
      window.electronAPI?.showFileInFolder(result.filePath)
    }
  }

  const handleQuarantine = () => {
    onQuarantine?.()
    onClose()
  }

  const formatFileSize = (size: string | number | undefined) => {
    if (!size) return 'Unknown'

    // If it's already a formatted string, return it
    if (typeof size === 'string' && size !== 'Unknown') {
      return size
    }

    // If it's a number, format it properly
    if (typeof size === 'number') {
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let bytes = size
      let unitIndex = 0

      while (bytes >= 1024 && unitIndex < units.length - 1) {
        bytes /= 1024
        unitIndex++
      }

      return `${bytes.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
    }

    return 'Unknown'
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Just now'
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-w-[90vw] max-h-[85vh] m-4 border-0 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-2xl overflow-hidden p-0 rounded-2xl">
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">
          {statusConfig.title} - {result.fileName}
        </DialogTitle>

        {/* Enhanced Header with Visual Impact */}
        <div className={`relative bg-gradient-to-r ${statusConfig.gradient} p-6 text-white`}>
          <div className="absolute inset-0 bg-black/10 rounded-t-2xl"></div>
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-6"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
                <StatusIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{statusConfig.title}</h1>
                <p className="text-white/90 text-base">{statusConfig.description}</p>
                <div className="flex items-center gap-4 mt-3 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium truncate max-w-xs">{result.fileName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(result.scanDate)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* Key Metrics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {/* Threat Detection Card */}
            <Card className={`relative overflow-hidden border-0 shadow-lg ${
              result.status === 'threat'
                ? 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
                : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Threats</p>
                    <p className={`text-3xl font-bold ${
                      result.status === 'threat' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {result.positives}
                    </p>
                    <p className="text-xs text-slate-500">out of {result.total}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    result.status === 'threat'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    <Shield className={`w-6 h-6 ${
                      result.status === 'threat' ? 'text-red-600' : 'text-green-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Engines Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Engines</p>
                    <p className="text-3xl font-bold text-blue-600">{result.total}</p>
                    <p className="text-xs text-slate-500">analyzed</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Size Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">File Size</p>
                    <p className="text-2xl font-bold text-purple-600">{formatFileSize(result.fileSize)}</p>
                    <p className="text-xs text-slate-500">bytes</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clean Percentage Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Clean Rate</p>
                    <p className="text-3xl font-bold text-emerald-600">{cleanPercentage}%</p>
                    <p className="text-xs text-slate-500">confidence</p>
                  </div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Visual Analysis Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Pie Chart Visualization */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Security Analysis
                </CardTitle>
                <CardDescription>
                  Visual breakdown of scan results across {result.total} security engines
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  {/* Custom Pie Chart */}
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-slate-200 dark:text-slate-700"
                      />
                      {/* Clean percentage arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={`${cleanPercentage * 2.51} 251.2`}
                        strokeLinecap="round"
                        className={result.status === 'threat' ? 'text-green-500' : 'text-green-600'}
                      />
                      {/* Threat percentage arc */}
                      {threatPercentage > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeDasharray={`${threatPercentage * 2.51} 251.2`}
                          strokeDashoffset={`-${cleanPercentage * 2.51}`}
                          strokeLinecap="round"
                          className="text-red-500"
                        />
                      )}
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          result.status === 'threat' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {cleanPercentage}%
                        </div>
                        <div className="text-xs text-slate-500">Clean</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Clean ({result.total - result.positives})
                    </span>
                  </div>
                  {result.positives > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Threats ({result.positives})
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  File Details
                </CardTitle>
                <CardDescription>
                  Comprehensive file information and scan metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">File Name</label>
                    <p className="font-mono text-sm break-all text-slate-900 dark:text-slate-100">{result.fileName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">File Size</label>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{formatFileSize(result.fileSize)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Scan Date</label>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{formatDate(result.scanDate)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Scan Duration</label>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{result.scanDuration ?? 'Just completed'}</p>
                  </div>
                </div>

                {result.scanId && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Scan ID</label>
                    <p className="font-mono text-xs break-all text-slate-600 dark:text-slate-400">{result.scanId}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Scan Summary Bar */}
          {result.engineStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Scan Summary</h4>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{result.scanDuration || 'Just completed'}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    result.status === 'threat' ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{
                    width: `${((result.engineStats.total - result.engineStats.threats) / result.engineStats.total) * 100}%`
                  }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-medium">
                  ✓ {result.engineStats.clean} Clean
                </span>
                {result.engineStats.threats > 0 && (
                  <span className="text-red-600 font-medium">
                    ⚠ {result.engineStats.threats} Threats
                  </span>
                )}
                <span className="text-slate-500">
                  {result.engineStats.total} Total
                </span>
              </div>
            </motion.div>
          )}

          {/* Enhanced Threat Details Section */}
          {result.status === 'threat' && result.detections && result.detections.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                    <AlertTriangle className="w-5 h-5" />
                    Threat Classifications
                  </CardTitle>
                  <CardDescription className="text-red-700 dark:text-red-300">
                    {result.detections.length} security engines detected malicious content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.detections.slice(0, showDetailedDetections ? result.detections.length : 5).map((detection, index) => (
                      <div key={`${detection.engine}-${index}`} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-red-200/50 dark:border-red-800/50">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{detection.engine}</div>
                          <div className="text-sm text-red-600 dark:text-red-400 font-mono">{detection.result}</div>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Threat
                        </Badge>
                      </div>
                    ))}

                    {result.detections.length > 5 && (
                      <div className="text-center pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDetailedDetections(!showDetailedDetections)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {showDetailedDetections ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              Show All {result.detections.length} Detections
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Enhanced Action Bar */}
        <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 rounded-b-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            {/* Primary Actions */}
            <div className="flex gap-3 flex-1">
              {result.filePath && (
                <Button
                  onClick={handleShowInFolder}
                  variant="outline"
                  className="flex-1 bg-white hover:bg-slate-50 border-slate-300"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Show in Folder
                </Button>
              )}

              {result.permalink && (
                <Button
                  onClick={handleViewOnVirusTotal}
                  variant="outline"
                  className="flex-1 bg-white hover:bg-slate-50 border-slate-300"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  View on VirusTotal
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-3">
              {result.status === 'threat' && onQuarantine && (
                <Button
                  onClick={handleQuarantine}
                  variant="destructive"
                  className="px-6"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Quarantine File
                </Button>
              )}

              <Button
                onClick={onClose}
                variant={result.status === 'threat' ? 'outline' : 'default'}
                className={`px-8 ${
                  result.status === 'threat'
                    ? 'bg-white hover:bg-slate-50 border-slate-300'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {result.status === 'threat' ? 'Close' : 'Done'}
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
