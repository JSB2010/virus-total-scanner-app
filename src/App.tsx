"use client"

import { useState, useEffect } from "react"
import { WelcomeScreen } from "./components/WelcomeScreen"
import { MainDashboard } from "./components/MainDashboard"
import { ThemeProvider } from "./components/ThemeProvider"
import { Toaster } from "./components/ui/toaster"

declare global {
  interface Window {
    electronAPI: any
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
