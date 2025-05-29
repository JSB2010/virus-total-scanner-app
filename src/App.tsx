"use client"

import { useEffect, useState } from "react"
import { MainDashboard } from "./components/MainDashboard"
import { ThemeProvider } from "./components/ThemeProvider"
import { Toaster } from "./components/ui/toaster"
import { WelcomeScreen } from "./components/WelcomeScreen"

declare global {
  interface Window {
    electronAPI: {
      // Store methods
      getStoreValue: (key: string) => Promise<any>
      setStoreValue: (key: string, value: any) => Promise<void>

      // File operations
      scanFile: (filePath: string) => Promise<any>
      deleteFile: (filePath: string) => Promise<boolean>
      showFileInFolder: (filePath: string) => Promise<void>

      // Dashboard methods
      getDashboardStats: () => Promise<any>
      getRecentScans: () => Promise<any[]>
      updateDashboardStats: (stats: any) => Promise<any>
      addScanResult: (result: any) => Promise<any>

      // Monitoring methods
      getMonitoringStatus: () => Promise<boolean>
      setMonitoringStatus: (status: boolean) => Promise<boolean>

      // Auto-start methods
      getAutoStartStatus: () => Promise<boolean>
      setAutoStart: (enable: boolean) => Promise<boolean>

      // File selection methods
      selectFiles: () => Promise<any[]>
      selectFolder: () => Promise<string | null>
      getFilesInFolder: (folderPath: string) => Promise<any[]>
      clearAllData: () => Promise<boolean>

      // Notification methods
      showNotification: (options: any) => Promise<boolean>

      // Quarantine methods
      quarantineFile: (options: any) => Promise<any>
      getQuarantinedFiles: () => Promise<any[]>
      restoreQuarantinedFile: (options: any) => Promise<any>
      deleteQuarantinedFile: (quarantineId: string) => Promise<any>
      getQuarantineStats: () => Promise<any>
      cleanupQuarantine: (daysOld: number) => Promise<any>
      isQuarantineAvailable: () => Promise<boolean>

      // External methods
      openExternal: (url: string) => Promise<boolean>

      // Event listeners
      onShowWelcome: (callback: () => void) => void
      onFileDetected: (callback: (data: any) => void) => void
      onScanProgress: (callback: (data: any) => void) => void
      onScanStarted: (callback: (event: any, data: any) => void) => void
      onShowSetupRequired: (callback: () => void) => void
      onShowManualScan: (callback: () => void) => void
      onShowSettings: (callback: () => void) => void

      // Event cleanup
      removeAllListeners: (channel: string) => void
      removeScanStartedListener: (callback: any) => void
      removeShowSetupRequiredListener: (callback: any) => void
    }
  }
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "main">("main")
  const [showManualScanDialog, setShowManualScanDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  useEffect(() => {
    const checkInitialSetup = async () => {
      const hasCompletedSetup = await window.electronAPI.getStoreValue("hasCompletedSetup")
      const apiKey = await window.electronAPI.getStoreValue("virusTotalApiKey")

      if (!hasCompletedSetup || !apiKey) {
        setCurrentScreen("welcome")
      } else {
        setCurrentScreen("main")
      }
    }

    checkInitialSetup()

    // Listen for welcome screen trigger
    window.electronAPI.onShowWelcome(() => {
      setCurrentScreen("welcome")
    })

    // Listen for tray menu events
    window.electronAPI.onShowManualScan(() => {
      setShowManualScanDialog(true)
    })

    window.electronAPI.onShowSettings(() => {
      setShowSettingsDialog(true)
    })

    return () => {
      window.electronAPI.removeAllListeners("show-welcome")
      window.electronAPI.removeAllListeners("show-manual-scan")
      window.electronAPI.removeAllListeners("show-settings")
    }
  }, [])

  const handleWelcomeComplete = () => {
    setCurrentScreen("main")
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {currentScreen === "welcome" && <WelcomeScreen onComplete={handleWelcomeComplete} />}

        {currentScreen === "main" && (
          <MainDashboard
            showManualScan={showManualScanDialog}
            onShowManualScanChange={setShowManualScanDialog}
            showSettings={showSettingsDialog}
            onShowSettingsChange={setShowSettingsDialog}
          />
        )}

        <Toaster />
      </div>
    </ThemeProvider>
  )
}
