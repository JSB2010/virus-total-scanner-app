const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  getStoreValue: (key) => ipcRenderer.invoke("get-store-value", key),
  setStoreValue: (key, value) => ipcRenderer.invoke("set-store-value", key, value),
  scanFile: (filePath) => ipcRenderer.invoke("scan-file", filePath),
  deleteFile: (filePath) => ipcRenderer.invoke("delete-file", filePath),
  showFileInFolder: (filePath) => ipcRenderer.invoke("show-file-in-folder", filePath),

  // Dashboard methods
  getDashboardStats: () => ipcRenderer.invoke("get-dashboard-stats"),
  getRecentScans: () => ipcRenderer.invoke("get-recent-scans"),
  updateDashboardStats: (stats) => ipcRenderer.invoke("update-dashboard-stats", stats),
  addScanResult: (result) => ipcRenderer.invoke("add-scan-result", result),
  getMonitoringStatus: () => ipcRenderer.invoke("get-monitoring-status"),
  setMonitoringStatus: (status) => ipcRenderer.invoke("set-monitoring-status", status),

  // File selection methods
  selectFiles: () => ipcRenderer.invoke("select-files"),
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  getFilesInFolder: (folderPath) => ipcRenderer.invoke("get-files-in-folder", folderPath),
  clearAllData: () => ipcRenderer.invoke("clear-all-data"),

  // Native notification methods
  showNotification: (options) => ipcRenderer.invoke("show-notification", options),
  showFileDetectionDialog: (options) => ipcRenderer.invoke("show-file-detection-dialog", options),

  // Quarantine methods
  quarantineFile: (options) => ipcRenderer.invoke("quarantine-file", options),
  getQuarantinedFiles: () => ipcRenderer.invoke("get-quarantined-files"),
  restoreQuarantinedFile: (options) => ipcRenderer.invoke("restore-quarantined-file", options),
  deleteQuarantinedFile: (quarantineId) => ipcRenderer.invoke("delete-quarantined-file", quarantineId),
  getQuarantineStats: () => ipcRenderer.invoke("get-quarantine-stats"),
  cleanupQuarantine: (daysOld) => ipcRenderer.invoke("cleanup-quarantine", daysOld),
  isQuarantineAvailable: () => ipcRenderer.invoke("is-quarantine-available"),

  // External link opening
  openExternal: (url) => ipcRenderer.invoke("open-external", url),

  // Error logging and crash reporting
  logError: (errorData) => ipcRenderer.invoke("log-error", errorData),
  getCrashLogs: () => ipcRenderer.invoke("get-crash-logs"),
  clearCrashLogs: () => ipcRenderer.invoke("clear-crash-logs"),

  // Advanced logging system
  logAdvanced: (logEntry) => ipcRenderer.invoke("log-advanced", logEntry),
  getAdvancedLogs: (criteria) => ipcRenderer.invoke("get-advanced-logs", criteria),
  clearAdvancedLogs: () => ipcRenderer.invoke("clear-advanced-logs"),

  // Auto-start methods
  getAutoStartStatus: () => ipcRenderer.invoke("get-auto-start-status"),
  setAutoStart: (enable) => ipcRenderer.invoke("set-auto-start", enable),

  // Event listeners
  onShowWelcome: (callback) => ipcRenderer.on("show-welcome", callback),
  onFileDetected: (callback) => ipcRenderer.on("file-detected", (event, data) => callback(data)),
  onScanProgress: (callback) => ipcRenderer.on("scan-progress", (event, data) => callback(data)),
  onScanStarted: (callback) => ipcRenderer.on("scan-started", (event, data) => callback(event, data)),
  onShowSetupRequired: (callback) => ipcRenderer.on("show-setup-required", callback),
  onShowManualScan: (callback) => ipcRenderer.on("show-manual-scan", callback),
  onShowSettings: (callback) => ipcRenderer.on("show-settings", callback),

  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  removeScanStartedListener: (callback) => ipcRenderer.removeListener("scan-started", callback),
  removeShowSetupRequiredListener: (callback) => ipcRenderer.removeListener("show-setup-required", callback),
})
