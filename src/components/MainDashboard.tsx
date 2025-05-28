"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Shield,
  AlertTriangle,
  Settings,
  Activity,
  FileText,
  RefreshCw,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import { SettingsDialog } from "./SettingsDialog"
import { ManualScanDialog } from "./ManualScanDialog"
import { ScanHistoryDialog } from "./ScanHistoryDialog"
import { ScanHistoryListDialog } from "./ScanHistoryListDialog"
import { ScanProgressDialog } from "./ScanProgressDialog"
import { ScanResultDialog } from "./ScanResultDialog"
import { useToast } from "../hooks/use-toast"
import { notificationService } from "../services/notificationService"
import { quarantineService } from "../services/quarantineService"

interface MainDashboardProps {
  onManualScan?: (filePath: string) => void
  showManualScan?: boolean
  onShowManualScanChange?: (show: boolean) => void
  showSettings?: boolean
  onShowSettingsChange?: (show: boolean) => void
  showScanProgress?: boolean
  onShowScanProgressChange?: (show: boolean) => void
}

export function MainDashboard({
  onManualScan,
  showManualScan = false,
  onShowManualScanChange,
  showSettings = false,
  onShowSettingsChange,
  showScanProgress = false,
  onShowScanProgressChange
}: Readonly<MainDashboardProps>) {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsDetected: 0,
    filesQuarantined: 0,
    lastScan: null,
    scanningSpeed: 0,
    systemHealth: 100,
    activeThreats: 0,
    quarantinedFiles: 0,
  })
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [recentScans, setRecentScans] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showScanHistory, setShowScanHistory] = useState(false)
  const [showScanHistoryList, setShowScanHistoryList] = useState(false)
  const [internalShowSettings, setInternalShowSettings] = useState(false)
  const [internalShowManualScan, setInternalShowManualScan] = useState(false)

  // Use external state if provided, otherwise use internal state
  const actualShowSettings = showSettings ?? internalShowSettings
  const actualShowManualScan = showManualScan ?? internalShowManualScan

  const setActualShowSettings = onShowSettingsChange ?? setInternalShowSettings
  const setActualShowManualScan = onShowManualScanChange ?? setInternalShowManualScan
  const [selectedScan, setSelectedScan] = useState<any>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatus, setScanStatus] = useState("")
  const [currentScanFile, setCurrentScanFile] = useState("")
  const [showScanResult, setShowScanResult] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [internalShowScanProgress, setInternalShowScanProgress] = useState(false)

  // Use internal state for scan progress
  const actualShowScanProgress = internalShowScanProgress
  const setActualShowScanProgress = setInternalShowScanProgress

  useEffect(() => {
    // Load stats and recent scans from storage
    loadDashboardData()

    // Removed old scan started handler - now using unified workflow

    const handleShowSetupRequired = () => {
      setActualShowSettings(true)
    }

    const handleFileDetected = async (fileData: any) => {
      console.log("File detected:", fileData)

      // Check if this is an auto-scan (user already chose to scan in system dialog)
      if (fileData.autoScan && fileData.skipPrompt) {
        console.log("🚀 UNIFIED SCAN: Starting immediate scan with progress tracking...")

        // Show notification that scan is starting
        await notificationService.notifyScanStart(fileData.fileName)

        // Start the unified scanning workflow with progress tracking
        await startUnifiedScan(fileData)
      } else {
        // This shouldn't happen anymore since dialog is handled in Electron main process
        console.log("File detected without proper autoScan flags - this should not happen in the new workflow")
      }
    }

    const startUnifiedScan = async (fileData: any) => {
      try {
        console.log(`[UNIFIED-SCAN] 🎯 Starting unified scan for: ${fileData.fileName}`)

        // Start the scan progress dialog immediately
        setActualShowScanProgress(true)
        setScanProgress(0)
        setScanStatus("Initializing scan...")
        setCurrentScanFile(fileData.fileName)

        // Use the existing scan-file IPC which has progress tracking
        const result = await window.electronAPI.scanFile(fileData.filePath)

        console.log(`[UNIFIED-SCAN] ✅ Scan completed for: ${fileData.fileName}`)
        console.log(`[UNIFIED-SCAN] 📊 Results: ${result.positives}/${result.total} threats detected`)

        // Close scan progress dialog
        setActualShowScanProgress(false)
        setScanProgress(0)
        setScanStatus("")
        setCurrentScanFile("")

        // Create unified scan result object
        const unifiedResult = {
          fileName: fileData.fileName,
          status: result.positives > 0 ? 'threat' : 'clean',
          positives: result.positives,
          total: result.total,
          scanId: result.scan_id,
          permalink: result.permalink,
          scanDate: new Date().toISOString(),
          filePath: fileData.filePath,
          detections: result.scans ? Object.entries(result.scans)
            .filter(([_, scan]: [string, any]) => scan.detected)
            .map(([engine, scan]: [string, any]) => ({
              engine,
              result: scan.result
            })) : [],
          // Additional metadata for enhanced display
          fileSize: fileData.size || fileData.fileSize,
          scanDuration: 'Just completed',
          engineStats: {
            clean: result.total - result.positives,
            threats: result.positives,
            total: result.total
          }
        }

        // Show unified scan result dialog
        setScanResult(unifiedResult)
        setShowScanResult(true)

        // Show completion notification
        if (result.positives > 0) {
          await notificationService.notifyScanComplete(fileData.fileName, 'threat', `${result.positives} threats detected`)

          // Auto-quarantine if threats detected (optional)
          if (result.positives > 0) {
            console.log(`[UNIFIED-SCAN] ⚠️ Threats detected, quarantine option available`)
          }
        } else {
          await notificationService.notifyScanComplete(fileData.fileName, 'clean')
        }

        // Refresh dashboard data
        await loadDashboardData()

        console.log(`[UNIFIED-SCAN] 🎉 Unified scan workflow completed successfully`)

      } catch (error) {
        console.error("[UNIFIED-SCAN] ❌ Scan failed:", error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

        // Close scan progress dialog on error
        setActualShowScanProgress(false)
        setScanProgress(0)
        setScanStatus("")
        setCurrentScanFile("")

        // Show error notification
        await notificationService.notifyScanComplete(fileData.fileName, 'error', errorMessage)

        // Show error in result dialog
        setScanResult({
          fileName: fileData.fileName,
          status: 'error',
          positives: 0,
          total: 0,
          scanDate: new Date().toISOString(),
          filePath: fileData.filePath,
          fileSize: fileData.size || fileData.fileSize,
          error: errorMessage
        })
        setShowScanResult(true)
      }
    }

    // Initialize notification service
    notificationService.requestPermissions()

    // Add event listeners for unified workflow
    window.electronAPI.onShowSetupRequired?.(handleShowSetupRequired)
    window.electronAPI.onFileDetected?.(handleFileDetected)

    // Add scan progress listener for real-time updates
    window.electronAPI.onScanProgress?.((data: any) => {
      console.log(`[UNIFIED-SCAN] Progress: ${data.progress}% - ${data.status}`)
      setScanProgress(data.progress)
      if (data.status) {
        setScanStatus(data.status)
      }
    })

    // Cleanup function
    return () => {
      // Remove event listeners if cleanup functions exist
      window.electronAPI.removeShowSetupRequiredListener?.(handleShowSetupRequired)
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load real stats from electron store
      const dashboardStats = await window.electronAPI.getDashboardStats()
      setStats(dashboardStats)

      // Load real recent scans
      const recentScansData = await window.electronAPI.getRecentScans()
      setRecentScans(recentScansData)

      // Load monitoring status
      const monitoringStatus = await window.electronAPI.getMonitoringStatus()
      setIsMonitoring(monitoringStatus)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status: string, threats: number) => {
    if (status === "clean") {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Clean
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          {threats} Threat{threats > 1 ? "s" : ""}
        </Badge>
      )
    }
  }

  const handleMonitoringToggle = async (checked: boolean) => {
    try {
      await window.electronAPI.setMonitoringStatus(checked)
      setIsMonitoring(checked)

      // Show native notification for monitoring status change
      await notificationService.notifyMonitoringStatusChange(checked)

      toast({
        title: checked ? "Monitoring Enabled" : "Monitoring Disabled",
        description: checked
          ? "Real-time file monitoring is now active"
          : "Real-time file monitoring has been paused",
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to update monitoring status:", error)
      toast({
        title: "Error",
        description: "Failed to update monitoring status",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadDashboardData()
      toast({
        title: "Dashboard Refreshed",
        description: "Latest scan data has been loaded",
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to refresh dashboard:", error)
      toast({
        title: "Refresh Failed",
        description: "Failed to load latest data",
        variant: "destructive",
      })
    }
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleQuarantine = async () => {
    if (!scanResult) return

    try {
      const result = await quarantineService.quarantineFile(
        scanResult.filePath || '',
        {
          fileName: scanResult.fileName,
          threats: scanResult.positives,
          scanId: scanResult.scanId,
          detections: scanResult.detections
        }
      )

      if (result.success) {
        await notificationService.notifyThreatQuarantined(scanResult.fileName)
        toast({
          title: "File Quarantined",
          description: `${scanResult.fileName} has been safely quarantined`,
          variant: "default",
        })
      } else {
        toast({
          title: "Quarantine Failed",
          description: result.error || "Unable to quarantine file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Quarantine failed:", error)
      toast({
        title: "Quarantine Error",
        description: "An error occurred while quarantining the file",
        variant: "destructive",
      })
    }
  }

  const handleManualScan = async (filePath: string) => {
    if (onManualScan) {
      onManualScan(filePath)
    } else {
      try {
        // Fallback: direct scan without progress dialog
        await window.electronAPI.scanFile(filePath)
        await loadDashboardData()
      } catch (error) {
        console.error("Manual scan failed:", error)
      }
    }
  }

  const handleScanHistoryClick = (scan: any) => {
    setSelectedScan(scan)
    setShowScanHistory(true)
  }

  const handleViewScanFromList = (scan: any) => {
    setSelectedScan(scan)
    setShowScanHistoryList(false)
    setShowScanHistory(true)
  }

  // Calculate threat level based on actual statistics
  const calculateThreatLevel = (): 'low' | 'medium' | 'high' | 'critical' => {
    const { threatsDetected, totalScans } = stats

    if (totalScans === 0) return 'low'

    const threatPercentage = (threatsDetected / totalScans) * 100
    const recentThreats = recentScans.filter(scan => scan.threats > 0).length

    // Critical: High threat percentage or many recent threats
    if (threatPercentage > 20 || recentThreats >= 3) return 'critical'

    // High: Moderate threat percentage or some recent threats
    if (threatPercentage > 10 || recentThreats >= 2) return 'high'

    // Medium: Low threat percentage or few recent threats
    if (threatPercentage > 5 || recentThreats >= 1) return 'medium'

    // Low: No or very few threats
    return 'low'
  }

  const threatLevel = calculateThreatLevel()

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'
      default: return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800'
    }
  }

  const getThreatLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle2 className="w-4 h-4" />
      case 'medium': return <AlertCircle className="w-4 h-4" />
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <XCircle className="w-4 h-4" />
      default: return <CheckCircle2 className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Ultra-Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
          <div className="relative glass rounded-3xl p-6 border border-white/30 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.div
                    className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${isMonitoring ? "bg-green-500" : "bg-red-500"} flex items-center justify-center shadow-lg border-2 border-white`}
                    animate={{
                      scale: isMonitoring ? [1, 1.3, 1] : 1,
                      boxShadow: isMonitoring ? ["0 0 0 0 rgba(34, 197, 94, 0.7)", "0 0 0 10px rgba(34, 197, 94, 0)", "0 0 0 0 rgba(34, 197, 94, 0)"] : "0 0 0 0 rgba(239, 68, 68, 0)"
                    }}
                    transition={{ duration: 2, repeat: isMonitoring ? Infinity : 0 }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                </div>
                <div>
                  <motion.h1
                    className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    Sentinel Guard
                  </motion.h1>
                  <motion.div
                    className="flex flex-wrap items-center gap-3 mt-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Badge
                      variant="outline"
                      className={`${getThreatLevelColor(threatLevel)} border-2 text-sm px-3 py-1 font-medium shadow-lg`}
                    >
                      {getThreatLevelIcon(threatLevel)}
                      <span className="ml-2 capitalize">{threatLevel} Risk</span>
                    </Badge>
                    <Badge variant="outline" className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 text-sm px-3 py-1 bg-white/50 dark:bg-slate-800/50">
                      <Activity className="w-4 h-4 mr-2" />
                      {stats.totalScans} Scans Today
                    </Badge>
                    <motion.div
                      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-slate-600/30 shadow-lg backdrop-blur-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div
                        className={`w-3 h-3 rounded-full ${isMonitoring ? "bg-green-500" : "bg-red-500"} shadow-lg`}
                        animate={{
                          scale: isMonitoring ? [1, 1.4, 1] : 1,
                          boxShadow: isMonitoring ? ["0 0 0 0 rgba(34, 197, 94, 0.7)", "0 0 0 8px rgba(34, 197, 94, 0)", "0 0 0 0 rgba(34, 197, 94, 0)"] : "none"
                        }}
                        transition={{ duration: 2, repeat: isMonitoring ? Infinity : 0 }}
                      />
                      <span className="text-sm font-semibold">{isMonitoring ? "Active Protection" : "Protection Paused"}</span>
                      <Switch
                        checked={isMonitoring}
                        onCheckedChange={handleMonitoringToggle}
                        className="scale-90"
                      />
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActualShowManualScan(true)}
                    className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-blue-300/50 dark:border-blue-600/50 h-10 px-4 font-medium shadow-lg backdrop-blur-sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Scan File
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScanHistoryList(true)}
                    className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 hover:from-indigo-500/20 hover:to-blue-500/20 border-indigo-300/50 dark:border-indigo-600/50 h-10 px-4 font-medium shadow-lg backdrop-blur-sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    History
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border-green-300/50 dark:border-green-600/50 h-10 px-4 font-medium shadow-lg backdrop-blur-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActualShowSettings(true)}
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-300/50 dark:border-purple-600/50 h-10 px-4 font-medium shadow-lg backdrop-blur-sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Ultra-Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 100 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:via-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Scans</CardTitle>
                <motion.div
                  className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </motion.div>
              </CardHeader>
              <CardContent className="relative pt-0">
                <motion.div
                  className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent"
                  key={stats.totalScans}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  {stats.totalScans.toLocaleString()}
                </motion.div>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-2 font-medium">Files scanned today</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-lg"></div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0, type: "spring", stiffness: 100 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 dark:from-red-900/20 dark:via-pink-900/20 dark:to-rose-900/20 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-pink-500/5 to-rose-500/5 group-hover:from-red-500/10 group-hover:via-pink-500/10 group-hover:to-rose-500/10 transition-all duration-500"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300">Threats Detected</CardTitle>
                <motion.div
                  className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl shadow-lg"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </motion.div>
              </CardHeader>
              <CardContent className="relative pt-0">
                <motion.div
                  className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400 bg-clip-text text-transparent"
                  key={stats.threatsDetected}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  {stats.threatsDetected.toLocaleString()}
                </motion.div>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-2 font-medium">
                  {stats.threatsDetected === 0 ? "All clear" : "Action required"}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-b-lg"></div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.2, type: "spring", stiffness: 100 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group"
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 group-hover:from-green-500/10 group-hover:via-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-500"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Files Protected</CardTitle>
                <motion.div
                  className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl shadow-lg"
                  whileHover={{ rotate: [0, 15, -15, 0], scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </motion.div>
              </CardHeader>
              <CardContent className="relative pt-0">
                <motion.div
                  className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent"
                  key={stats.totalScans - stats.threatsDetected}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  {(stats.totalScans - stats.threatsDetected).toLocaleString()}
                </motion.div>
                <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-2 font-medium">
                  {stats.totalScans > 0 ? `${Math.round(((stats.totalScans - stats.threatsDetected) / stats.totalScans) * 100)}% clean` : "No scans yet"}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-b-lg"></div>
              </CardContent>
            </Card>
          </motion.div>
        </div>



        {/* Enhanced Recent Scans Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="glass border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Recent Scans
                  </CardTitle>
                  <CardDescription>Click on any scan to view detailed results</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScanHistoryList(true)}
                  className="bg-white/50 hover:bg-white/70 border-white/20"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence>
                  {recentScans.slice(0, 5).map((scan, index) => (
                    <motion.div
                      key={scan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/20 hover:shadow-lg hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200 cursor-pointer hover-lift"
                      onClick={() => handleScanHistoryClick(scan)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${scan.status === 'clean' ? 'bg-green-100 text-green-600' :
                          scan.status === 'threat' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {scan.status === 'clean' ? <CheckCircle2 className="w-5 h-5" /> :
                           scan.status === 'threat' ? <XCircle className="w-5 h-5" /> :
                           <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-medium">{scan.fileName}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {formatDate(scan.scanDate)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(scan.status, scan.threats)}
                        <div className="text-xs text-muted-foreground">
                          {scan.threats > 0 ? `${scan.threats} threats` : 'Clean'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {recentScans.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No scans yet</p>
                    <p className="text-sm">Files will appear here after scanning</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setActualShowManualScan(true)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Start Your First Scan
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>



      {/* Dialog Components */}
      <SettingsDialog
        open={actualShowSettings}
        onOpenChange={setActualShowSettings}
      />

      <ManualScanDialog
        open={actualShowManualScan}
        onOpenChange={setActualShowManualScan}
        onScanFile={handleManualScan}
      />

      <ScanHistoryDialog
        open={showScanHistory}
        onOpenChange={setShowScanHistory}
        scanData={selectedScan}
      />

      <ScanHistoryListDialog
        open={showScanHistoryList}
        onOpenChange={setShowScanHistoryList}
        onViewScan={handleViewScanFromList}
      />

      <ScanProgressDialog
        open={actualShowScanProgress}
        progress={scanProgress}
        fileName={currentScanFile}
        status={scanStatus || `Scanning ${currentScanFile}...`}
      />

      <ScanResultDialog
        open={showScanResult}
        onClose={() => setShowScanResult(false)}
        result={scanResult}
        onQuarantine={handleQuarantine}
      />
      </div>
    </div>
  )
}
