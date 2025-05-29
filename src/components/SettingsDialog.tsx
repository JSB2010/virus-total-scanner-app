"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  FolderOpen,
  Key,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Trash2,
  X
} from "lucide-react"
import { useEffect, useState } from "react"

// import { useTheme } from "./ThemeProvider"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ScanLocation {
  id: string
  path: string
  name: string
  enabled: boolean
}

export function SettingsDialog({ open, onOpenChange }: Readonly<SettingsDialogProps>) {
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  // const { theme, setTheme } = useTheme()

  // Settings state
  const [settings, setSettings] = useState({
    apiKey: "",
    realTimeMonitoring: true,
    autoDelete: false,
    scanArchives: true,
    startWithSystem: true,
    showNotifications: true,
    quarantineThreats: false,
    scanOnDownload: true,
    autoScan: false,
    maxFileSize: 100, // MB
    excludeExtensions: [".tmp", ".log"],
    scanLocations: [
      { id: "1", path: "", name: "Downloads", enabled: true },
      { id: "2", path: "", name: "Desktop", enabled: false },
      { id: "3", path: "", name: "Documents", enabled: false }
    ] as ScanLocation[]
  })

  const [newLocation, setNewLocation] = useState("")
  const [newExtension, setNewExtension] = useState("")

  useEffect(() => {
    if (open) {
      loadSettings()
    }
  }, [open])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const apiKey = await window.electronAPI.getStoreValue("virusTotalApiKey") ?? ""
      const monitoring = await window.electronAPI.getMonitoringStatus()
      const storedSettings = await window.electronAPI.getStoreValue("appSettings") ?? {}
      const autoStartStatus = await window.electronAPI.getAutoStartStatus()

      setSettings(prev => ({
        ...prev,
        apiKey,
        realTimeMonitoring: monitoring,
        startWithSystem: autoStartStatus,
        ...storedSettings
      }))
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsLoading(true)

      // Save API key
      if (settings.apiKey) {
        await window.electronAPI.setStoreValue("virusTotalApiKey", settings.apiKey)
      }

      // Save monitoring status
      await window.electronAPI.setMonitoringStatus(settings.realTimeMonitoring)

      // Save auto-start setting
      const autoStartResult = await window.electronAPI.setAutoStart(settings.startWithSystem)
      if (!autoStartResult.success && settings.startWithSystem) {
        console.warn("Failed to enable auto-start:", autoStartResult.error)
        // Show user-friendly error message
        alert(`Auto-start could not be enabled: ${autoStartResult.error}`)
      }

      // Save other settings
      const { apiKey, startWithSystem, ...otherSettings } = settings
      await window.electronAPI.setStoreValue("appSettings", otherSettings)

      // Save auto-scan setting separately for easy access
      await window.electronAPI.setStoreValue("autoScan", settings.autoScan)

      // Show success feedback
      setTimeout(() => setIsLoading(false), 500)
    } catch (error) {
      console.error("Failed to save settings:", error)
      setIsLoading(false)
    }
  }

  const addScanLocation = async () => {
    if (!newLocation.trim()) return

    try {
      const path = await window.electronAPI.selectFolder()
      if (path) {
        const newLoc: ScanLocation = {
          id: Date.now().toString(),
          path,
          name: newLocation.trim(),
          enabled: true
        }
        setSettings(prev => ({
          ...prev,
          scanLocations: [...prev.scanLocations, newLoc]
        }))
        setNewLocation("")
      }
    } catch (error) {
      console.error("Failed to add scan location:", error)
    }
  }

  const removeScanLocation = (id: string) => {
    setSettings(prev => ({
      ...prev,
      scanLocations: prev.scanLocations.filter(loc => loc.id !== id)
    }))
  }

  const toggleScanLocation = (id: string) => {
    setSettings(prev => ({
      ...prev,
      scanLocations: prev.scanLocations.map(loc =>
        loc.id === id ? { ...loc, enabled: !loc.enabled } : loc
      )
    }))
  }

  const addExcludedExtension = () => {
    if (!newExtension.trim() || settings.excludeExtensions.includes(newExtension.trim())) return

    setSettings(prev => ({
      ...prev,
      excludeExtensions: [...prev.excludeExtensions, newExtension.trim()]
    }))
    setNewExtension("")
  }

  const removeExcludedExtension = (extension: string) => {
    setSettings(prev => ({
      ...prev,
      excludeExtensions: prev.excludeExtensions.filter(ext => ext !== extension)
    }))
  }

  const clearAllData = async () => {
    if (confirm("Are you sure you want to clear all scan history and statistics? This cannot be undone.")) {
      try {
        await window.electronAPI.clearAllData()
        // Show success message
      } catch (error) {
        console.error("Failed to clear data:", error)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-[90vw] max-h-[85vh] m-4 flex flex-col border-0 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-2xl rounded-2xl overflow-hidden">
        <DialogHeader className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Sentinel Guard Settings
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base">
                Configure your security preferences and monitoring options
              </DialogDescription>
            </div>
          </motion.div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-0 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <TabsList className="grid w-full grid-cols-4 flex-shrink-0 bg-white/50 dark:bg-slate-800/50 border border-white/20 p-1 rounded-xl shadow-lg">
                <TabsTrigger
                  value="general"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="scanning"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Scanning
                </TabsTrigger>
                <TabsTrigger
                  value="locations"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Locations
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <div className="flex-1 overflow-y-auto mt-6 pr-2 min-h-0 custom-scrollbar max-h-[calc(85vh-250px)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="general" className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <Card className="glass border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-3 text-lg">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            VirusTotal API Configuration
                          </CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">
                            Configure your VirusTotal API key for advanced threat detection
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-3">
                            <Label htmlFor="apiKey" className="text-sm font-medium">API Key</Label>
                            <div className="flex gap-3">
                              <div className="relative flex-1">
                                <Input
                                  id="apiKey"
                                  type={showApiKey ? "text" : "password"}
                                  value={settings.apiKey}
                                  onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                                  placeholder="Enter your VirusTotal API key"
                                  className="pr-12 bg-white/50 dark:bg-slate-800/50 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-white/20"
                                  onClick={() => setShowApiKey(!showApiKey)}
                                >
                                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => window.open('https://www.virustotal.com/gui/my-apikey', '_blank')}
                                className="bg-white/50 hover:bg-white/70 border-white/20 whitespace-nowrap"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Get API Key
                              </Button>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start gap-2">
                                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Secure API Integration</p>
                                  <p>Your API key is encrypted and stored locally. It's never shared with third parties.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Card className="glass border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-3 text-lg">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            Protection Settings
                          </CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">
                            Configure real-time protection and system integration
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/20 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
                              <div className="space-y-1">
                                <Label className="text-sm font-medium">Real-time Monitoring</Label>
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                  Automatically scan new files as they're downloaded or created
                                </div>
                              </div>
                              <Switch
                                checked={settings.realTimeMonitoring}
                                onCheckedChange={(checked) =>
                                  setSettings(prev => ({ ...prev, realTimeMonitoring: checked }))
                                }
                                className="data-[state=checked]:bg-green-600"
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/20 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
                              <div className="space-y-1">
                                <Label className="text-sm font-medium">Show Notifications</Label>
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                  Display system notifications for scan results and threats
                                </div>
                              </div>
                              <Switch
                                checked={settings.showNotifications}
                                onCheckedChange={(checked) =>
                                  setSettings(prev => ({ ...prev, showNotifications: checked }))
                                }
                                className="data-[state=checked]:bg-blue-600"
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/20 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
                              <div className="space-y-1">
                                <Label className="text-sm font-medium">Start with Windows</Label>
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                  Launch DropSentinel automatically when Windows starts (hidden in system tray)
                                </div>
                              </div>
                              <Switch
                                checked={settings.startWithSystem}
                                onCheckedChange={(checked) =>
                                  setSettings(prev => ({ ...prev, startWithSystem: checked }))
                                }
                                className="data-[state=checked]:bg-purple-600"
                                disabled={process.platform !== 'win32'}
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/20 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-200">
                              <div className="space-y-1">
                                <Label className="text-sm font-medium">Scan on Download</Label>
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                  Automatically scan files when they're downloaded from the internet
                                </div>
                              </div>
                              <Switch
                                checked={settings.scanOnDownload}
                                onCheckedChange={(checked) =>
                                  setSettings(prev => ({ ...prev, scanOnDownload: checked }))
                                }
                                className="data-[state=checked]:bg-orange-600"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                  </TabsContent>

                  <TabsContent value="scanning" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Scan Behavior
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Auto-delete Threats</Label>
                            <div className="text-sm text-muted-foreground">
                              Automatically delete files identified as malicious
                            </div>
                          </div>
                          <Switch
                            checked={settings.autoDelete}
                            onCheckedChange={(checked) =>
                              setSettings(prev => ({ ...prev, autoDelete: checked }))
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Quarantine Threats</Label>
                            <div className="text-sm text-muted-foreground">
                              Move suspicious files to quarantine instead of deleting
                            </div>
                          </div>
                          <Switch
                            checked={settings.quarantineThreats}
                            onCheckedChange={(checked) =>
                              setSettings(prev => ({ ...prev, quarantineThreats: checked }))
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Scan Archives</Label>
                            <div className="text-sm text-muted-foreground">
                              Scan contents of ZIP, RAR, and other archive files
                            </div>
                          </div>
                          <Switch
                            checked={settings.scanArchives}
                            onCheckedChange={(checked) =>
                              setSettings(prev => ({ ...prev, scanArchives: checked }))
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Auto-scan Without Prompting</Label>
                            <div className="text-sm text-muted-foreground">
                              Automatically scan new files without asking for confirmation
                            </div>
                          </div>
                          <Switch
                            checked={settings.autoScan}
                            onCheckedChange={(checked) =>
                              setSettings(prev => ({ ...prev, autoScan: checked }))
                            }
                          />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <Label>Maximum File Size (MB)</Label>
                          <Input
                            type="number"
                            value={settings.maxFileSize}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              maxFileSize: parseInt(e.target.value) || 100
                            }))}
                            min="1"
                            max="1000"
                          />
                          <div className="text-sm text-muted-foreground">
                            Files larger than this will be skipped
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Excluded File Extensions</CardTitle>
                        <CardDescription>
                          File types that will be skipped during scanning
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder=".tmp, .log, .cache"
                            value={newExtension}
                            onChange={(e) => setNewExtension(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addExcludedExtension()}
                          />
                          <Button onClick={addExcludedExtension} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {settings.excludeExtensions.map((ext) => (
                            <Badge key={ext} variant="secondary" className="flex items-center gap-1">
                              {ext}
                              <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => removeExcludedExtension(ext)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="locations" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          Scan Locations
                        </CardTitle>
                        <CardDescription>
                          Configure which folders to monitor for new files
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Location name (e.g., Downloads, Desktop)"
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                          />
                          <Button onClick={addScanLocation} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Location
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <AnimatePresence>
                            {settings.scanLocations.map((location) => (
                              <motion.div
                                key={location.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Switch
                                    checked={location.enabled}
                                    onCheckedChange={() => toggleScanLocation(location.id)}
                                  />
                                  <div>
                                    <div className="font-medium">{location.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {location.path || "System default location"}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeScanLocation(location.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Advanced Options
                        </CardTitle>
                        <CardDescription>
                          Advanced settings and data management
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                            <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                            <p className="text-sm text-red-600 mb-3">
                              These actions cannot be undone. Please proceed with caution.
                            </p>
                            <Button
                              variant="destructive"
                              onClick={clearAllData}
                              className="w-full"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Clear All Scan History & Statistics
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Application Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Version:</span>
                          <span>1.0.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Build:</span>
                          <span>2024.01.15</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">API Status:</span>
                          <Badge variant={settings.apiKey ? "default" : "destructive"}>
                            {settings.apiKey ? "Connected" : "Not Configured"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex-shrink-0 pt-6 border-t border-white/20"
        >
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/50 hover:bg-white/70 border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={saveSettings}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
