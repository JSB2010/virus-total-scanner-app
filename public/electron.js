const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, shell, nativeImage, Notification } = require("electron")
const path = require("path")
const isDev = process.env.ELECTRON_IS_DEV === "1"
const chokidar = require("chokidar")
const os = require("os")
const fs = require("fs")

// Cross-platform auto-start functionality
function setAutoStart(enable) {
  // Don't allow auto-start in development mode
  if (isDev) {
    console.log('[AUTO-START] Auto-start disabled in development mode')
    return { success: false, error: 'Auto-start not available in development mode' }
  }

  try {
    if (enable) {
      // Cross-platform login item settings
      const loginSettings = {
        openAtLogin: true,
        openAsHidden: true,
      }

      // Platform-specific configurations
      if (process.platform === 'win32') {
        loginSettings.path = process.execPath
        loginSettings.args = ['--hidden']
      } else if (process.platform === 'darwin') {
        // macOS: Use app bundle path and set as background app
        loginSettings.path = process.execPath
        loginSettings.args = ['--hidden', '--background']
      }

      app.setLoginItemSettings(loginSettings)

      // Verify the setting was applied
      const verification = app.getLoginItemSettings()
      if (verification.openAtLogin) {
        console.log(`[AUTO-START] ✅ Auto-start enabled successfully for ${process.platform}`)
        return { success: true }
      } else {
        console.log('[AUTO-START] ⚠️ Auto-start setting may not have been applied')
        const errorMsg = process.platform === 'win32'
          ? 'Auto-start setting could not be verified. Try running as administrator.'
          : 'Auto-start setting could not be verified. Check System Preferences > Users & Groups > Login Items.'
        return { success: false, error: errorMsg }
      }
    } else {
      // Remove from startup
      app.setLoginItemSettings({
        openAtLogin: false
      })
      console.log('[AUTO-START] ❌ Auto-start disabled')
      return { success: true }
    }
  } catch (error) {
    console.error('[AUTO-START] Error setting auto-start:', error)
    const errorMsg = process.platform === 'win32'
      ? `Failed to modify startup settings: ${error.message}. Try running as administrator.`
      : `Failed to modify login items: ${error.message}. Check System Preferences permissions.`
    return {
      success: false,
      error: errorMsg
    }
  }
}

function getAutoStartStatus() {
  try {
    const settings = app.getLoginItemSettings()
    return settings.openAtLogin
  } catch (error) {
    console.error('[AUTO-START] Error getting auto-start status:', error)
    return false
  }
}

let Store
let store
let fileWatcher
let isBackgroundMode = false

// macOS-specific app behavior management
function setMacOSAppBehavior(backgroundMode = false) {
  if (process.platform !== 'darwin') {
    return
  }

  isBackgroundMode = backgroundMode

  if (backgroundMode) {
    // Hide from dock when in background mode
    if (app.dock) {
      app.dock.hide()
    }
    console.log('[MACOS] App set to background mode - hidden from dock')
  } else {
    // Show in dock when window is visible
    if (app.dock) {
      app.dock.show()
    }
    console.log('[MACOS] App set to foreground mode - visible in dock')
  }
}

function getMacOSAppBehavior() {
  return isBackgroundMode
}

// Helper function for auto-start menu label
function getAutoStartMenuLabel(autoStartEnabled) {
  if (process.platform === 'win32') {
    return autoStartEnabled ? "Disable Auto-Start" : "Enable Auto-Start"
  } else if (process.platform === 'darwin') {
    return autoStartEnabled ? "Disable Auto-Start" : "Enable Auto-Start"
  } else {
    return "Auto-Start (Not Supported)"
  }
}

// Enhanced notification function for macOS with interactive actions
function showMacOSNotification(title, body, options = {}) {
  if (process.platform !== 'darwin') {
    return showNotification(title, body)
  }

  // Use native macOS notifications with enhanced options
  const notification = new Notification({
    title,
    body,
    icon: getIconPath("app-icon.png"),
    sound: options.sound || 'default',
    urgency: options.urgency || 'normal',
    timeoutType: options.timeoutType || 'default',
    actions: options.actions || [],
    closeButtonText: options.closeButtonText || 'Close',
    hasReply: options.hasReply || false,
    replyPlaceholder: options.replyPlaceholder || '',
    silent: options.silent || false
  })

  notification.on('click', () => {
    // Show main window when notification is clicked
    if (mainWindow) {
      setMacOSAppBehavior(false) // Show in dock
      mainWindow.show()
      mainWindow.focus()
    } else {
      createWindow()
    }
  })

  // Handle notification actions
  notification.on('action', (index) => {
    if (options.actionHandlers && options.actionHandlers[index]) {
      options.actionHandlers[index]()
    }
  })

  notification.show()
  return notification
}

// Enhanced file detection notification with actions
function showFileDetectionNotification(fileName, filePath) {
  if (process.platform !== 'darwin') {
    return showNotification("File Detected", `New file detected: ${fileName}`)
  }

  return showMacOSNotification(
    "New File Detected",
    `${fileName} was added to Downloads`,
    {
      actions: [
        { type: 'button', text: 'Scan Now' },
        { type: 'button', text: 'Ignore' }
      ],
      actionHandlers: [
        () => {
          // Scan action
          if (mainWindow) {
            setMacOSAppBehavior(false)
            mainWindow.show()
            mainWindow.focus()
            mainWindow.webContents.send("file-detected", {
              fileName,
              filePath,
              autoScan: true,
              skipPrompt: true
            })
          }
        },
        () => {
          // Ignore action - do nothing
          console.log(`[NOTIFICATION] User ignored file: ${fileName}`)
        }
      ],
      sound: 'default'
    }
  )
}

// macOS keyboard shortcuts setup
function setupMacOSKeyboardShortcuts() {
  if (process.platform !== 'darwin') return

  const { globalShortcut } = require('electron')

  // Register global shortcuts for macOS
  try {
    // Cmd+Shift+S - Quick Scan
    globalShortcut.register('CommandOrControl+Shift+S', () => {
      if (mainWindow) {
        setMacOSAppBehavior(false)
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.send("show-manual-scan")
      } else {
        createWindow()
      }
    })

    // Cmd+Shift+D - Show Dashboard
    globalShortcut.register('CommandOrControl+Shift+D', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
          setMacOSAppBehavior(true)
        } else {
          setMacOSAppBehavior(false)
          mainWindow.show()
          mainWindow.focus()
        }
      } else {
        createWindow()
      }
    })

    // Cmd+Shift+M - Toggle Monitoring
    globalShortcut.register('CommandOrControl+Shift+M', () => {
      const currentStatus = store.get("isMonitoring", true)
      const newStatus = !currentStatus
      store.set("isMonitoring", newStatus)

      if (newStatus) {
        startFileWatcher()
      } else {
        stopFileWatcher()
      }

      showMacOSNotification(
        "Monitoring Status",
        `File monitoring ${newStatus ? "enabled" : "disabled"}`,
        { silent: true }
      )
    })

    console.log('[MACOS] Global keyboard shortcuts registered')
  } catch (error) {
    console.error('[MACOS] Failed to register global shortcuts:', error)
  }
}

// macOS Spotlight integration
function setupSpotlightIntegration() {
  if (process.platform !== 'darwin') return

  // Register URL scheme for Spotlight integration
  app.setAsDefaultProtocolClient('dropsentinel')

  // Handle protocol URLs (e.g., dropsentinel://scan)
  app.on('open-url', (event, url) => {
    event.preventDefault()
    console.log('[SPOTLIGHT] Received URL:', url)

    const urlObj = new URL(url)
    const action = urlObj.pathname.replace('/', '')

    switch (action) {
      case 'scan':
        if (mainWindow) {
          setMacOSAppBehavior(false)
          mainWindow.show()
          mainWindow.focus()
          mainWindow.webContents.send("show-manual-scan")
        } else {
          createWindow()
        }
        break
      case 'dashboard':
        if (mainWindow) {
          setMacOSAppBehavior(false)
          mainWindow.show()
          mainWindow.focus()
        } else {
          createWindow()
        }
        break
      default:
        console.log('[SPOTLIGHT] Unknown action:', action)
    }
  })
}

// Enhanced macOS drag & drop functionality
function setupMacOSDragDrop() {
  if (process.platform !== 'darwin' || !mainWindow) return

  // Enhanced drag & drop with visual feedback
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.executeJavaScript(`
      // Enhanced drag & drop for macOS
      const body = document.body;
      let dragCounter = 0;

      // Add macOS-style drag overlay
      const createDragOverlay = () => {
        const overlay = document.createElement('div');
        overlay.id = 'macos-drag-overlay';
        overlay.style.cssText = \`
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 122, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 3px dashed #007AFF;
          border-radius: 12px;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 24px;
          font-weight: 600;
          color: #007AFF;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
        \`;
        overlay.innerHTML = '🛡️ Drop files to scan with DropSentinel';
        return overlay;
      };

      let dragOverlay = null;

      body.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;

        if (dragCounter === 1) {
          dragOverlay = createDragOverlay();
          body.appendChild(dragOverlay);
          setTimeout(() => dragOverlay.style.opacity = '1', 10);
        }
      });

      body.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;

        if (dragCounter === 0 && dragOverlay) {
          dragOverlay.style.opacity = '0';
          setTimeout(() => {
            if (dragOverlay && dragOverlay.parentNode) {
              dragOverlay.parentNode.removeChild(dragOverlay);
            }
            dragOverlay = null;
          }, 200);
        }
      });

      body.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      body.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;

        if (dragOverlay) {
          dragOverlay.style.opacity = '0';
          setTimeout(() => {
            if (dragOverlay && dragOverlay.parentNode) {
              dragOverlay.parentNode.removeChild(dragOverlay);
            }
            dragOverlay = null;
          }, 200);
        }

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
          // Send files to main process for scanning
          window.electronAPI?.handleDragDropFiles?.(files.map(f => f.path));
        }
      });
    `)
  })
}

// Enhanced macOS Notification Center integration
function setupNotificationCenter() {
  if (process.platform !== 'darwin') return

  // Set app notification settings
  app.setAppUserModelId('com.dropsentinel.app')

  // Handle notification responses
  app.on('notification-action', (event, notificationId, actionIndex) => {
    console.log('[NOTIFICATION] Action clicked:', { notificationId, actionIndex })
  })

  app.on('notification-click', (event, notificationId) => {
    console.log('[NOTIFICATION] Notification clicked:', notificationId)

    // Show main window when notification is clicked
    if (mainWindow) {
      setMacOSAppBehavior(false)
      mainWindow.show()
      mainWindow.focus()
    } else {
      createWindow()
    }
  })

  app.on('notification-reply', (event, notificationId, reply) => {
    console.log('[NOTIFICATION] Notification reply:', { notificationId, reply })
  })
}

// VirusTotal API functions
async function uploadFileToVirusTotal(filePath, apiKey, progressCallback) {
  const FormData = require('form-data')
  const https = require('https')

  return new Promise((resolve, reject) => {
    const form = new FormData()
    const fileStream = fs.createReadStream(filePath)
    form.append('file', fileStream)

    // Get file size for progress calculation
    const stats = fs.statSync(filePath)
    const fileSize = stats.size
    let uploadedBytes = 0

    const options = {
      hostname: 'www.virustotal.com',
      path: '/api/v3/files',
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        ...form.getHeaders()
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          if (res.statusCode === 200) {
            if (progressCallback) progressCallback(100)
            resolve(result)
          } else {
            reject(new Error(result.error?.message || `HTTP ${res.statusCode}`))
          }
        } catch (error) {
          console.error('[VIRUSTOTAL] Error parsing response:', error)
          reject(new Error('Invalid response from VirusTotal'))
        }
      })
    })

    req.on('error', reject)

    // Track upload progress
    if (progressCallback) {
      fileStream.on('data', (chunk) => {
        uploadedBytes += chunk.length
        const progress = Math.min(100, (uploadedBytes / fileSize) * 100)
        progressCallback(progress)
      })
    }

    form.pipe(req)
  })
}

async function pollForAnalysisResults(analysisId, apiKey, progressCallback, maxAttempts = 30) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await getAnalysisResult(analysisId, apiKey)

      // Update progress based on attempt
      const progress = Math.min(95, (attempt / maxAttempts) * 100)
      if (progressCallback) {
        progressCallback(progress)
      }

      if (result.data.attributes.status === 'completed') {
        if (progressCallback) progressCallback(100)
        return result
      }

      // Wait 10 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 10000))
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  throw new Error('Analysis timeout - please check VirusTotal manually')
}

async function getAnalysisResult(analysisId, apiKey) {
  const https = require('https')

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.virustotal.com',
      path: `/api/v3/analyses/${analysisId}`,
      method: 'GET',
      headers: {
        'x-apikey': apiKey
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          if (res.statusCode === 200) {
            resolve(result)
          } else {
            reject(new Error(result.error?.message || `HTTP ${res.statusCode}`))
          }
        } catch (error) {
          console.error('[VIRUSTOTAL] Error parsing analysis response:', error)
          reject(new Error('Invalid response from VirusTotal'))
        }
      })
    })

    req.on('error', reject)
    req.end()
  })
}

function formatScanResults(analysisResult, fileName) {
  const stats = analysisResult.data.attributes.stats
  const engines = analysisResult.data.attributes.results

  const detections = []
  const engineNames = Object.keys(engines)

  for (const engineName of engineNames) {
    const engine = engines[engineName]
    if (engine.category === 'malicious') {
      detections.push({
        engine: engineName,
        result: engine.result,
        category: engine.category,
        method: engine.method
      })
    }
  }

  return {
    fileName,
    scanId: analysisResult.data.id,
    positives: stats.malicious,
    total: stats.malicious + stats.harmless + stats.suspicious + stats.undetected,
    scanDate: new Date().toISOString(),
    permalink: `https://www.virustotal.com/gui/file-analysis/${analysisResult.data.id}`,
    detections,
    stats: {
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      harmless: stats.harmless,
      undetected: stats.undetected
    },
    sha256: analysisResult.data.attributes.sha256,
    md5: analysisResult.data.attributes.md5,
    sha1: analysisResult.data.attributes.sha1
  }
}

let mainWindow
let tray

// Placeholder functions for scanDownloadsFolder and showSettings
// These need to be implemented based on your application's logic
function scanDownloadsFolder() {
  if (mainWindow) {
    mainWindow.webContents.send("scan-downloads") // Send a message to the renderer process
  }
}

function showSettings() {
  if (mainWindow) {
    mainWindow.webContents.send("show-settings") // Send a message to the renderer process
    mainWindow.show()
  }
}

// Get platform-appropriate icon path with fallbacks
function getIconPath(iconName) {
  const assetsDir = path.join(__dirname, "assets")
  const iconPath = path.join(assetsDir, iconName)

  // Check if custom icon exists
  if (fs.existsSync(iconPath)) {
    return iconPath
  }

  // Fallback to placeholder icons
  const fallbackPath = path.join(__dirname, "placeholder-logo.png")
  if (fs.existsSync(fallbackPath)) {
    return fallbackPath
  }

  // Create a simple icon if nothing exists
  return null
}

// Create enhanced tray icon with dynamic status
function createTray() {
  const iconPath = getIconPath("tray-icon.png")

  let trayIcon
  if (iconPath) {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  } else {
    // Create a simple tray icon programmatically
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)

  // Update tray menu dynamically
  updateTrayMenu()

  // Set tooltip with current status
  updateTrayTooltip()

  // Handle tray click events
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
        // Hide from dock on macOS when hiding window
        if (process.platform === 'darwin') {
          setMacOSAppBehavior(true)
        }
      } else {
        mainWindow.show()
        mainWindow.focus()
        // Show in dock on macOS when showing window
        if (process.platform === 'darwin') {
          setMacOSAppBehavior(false)
        }
      }
    } else {
      createWindow()
    }
  })

  // Handle right-click for context menu (Windows)
  tray.on('right-click', () => {
    updateTrayMenu()
    tray.popUpContextMenu()
  })
}

function updateTrayMenu() {
  const isMonitoring = store.get("isMonitoring", true)
  const stats = store.get("dashboardStats", { totalScans: 0, threatsDetected: 0 })
  const autoStartEnabled = getAutoStartStatus()

  // Enhanced menu with better organization for macOS
  const menuTemplate = [
    {
      label: "DropSentinel",
      enabled: false,
      icon: getIconPath("app-icon.png") ? nativeImage.createFromPath(getIconPath("app-icon.png")).resize({ width: 16, height: 16 }) : undefined
    },
    { type: "separator" },
    {
      label: `${isMonitoring ? "🟢 Active" : "🔴 Paused"} • ${stats.totalScans} scans • ${stats.threatsDetected} threats`,
      enabled: false,
      toolTip: `Monitoring: ${isMonitoring ? "Active" : "Paused"}\nScans Today: ${stats.totalScans}\nThreats Detected: ${stats.threatsDetected}`
    },
    { type: "separator" },
    {
      label: "Show Dashboard",
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
          mainWindow.setSkipTaskbar(false) // Show in taskbar when visible
          // Show in dock on macOS when showing window
          if (process.platform === 'darwin') {
            setMacOSAppBehavior(false)
          }
        } else {
          createWindow()
        }
      },
    },
    {
      label: "Quick Scan",
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
          mainWindow.setSkipTaskbar(false) // Show in taskbar when visible
          // Show in dock on macOS when showing window
          if (process.platform === 'darwin') {
            setMacOSAppBehavior(false)
          }
          mainWindow.webContents.send("show-manual-scan")
        } else {
          createWindow()
        }
      },
    },
    { type: "separator" },
    {
      label: isMonitoring ? "Pause Monitoring" : "Resume Monitoring",
      click: () => {
        const newStatus = !isMonitoring
        store.set("isMonitoring", newStatus)
        if (newStatus) {
          startFileWatcher()
        } else {
          stopFileWatcher()
        }
        updateTrayMenu()
        updateTrayTooltip()
        showNotification(
          "Monitoring Status",
          `File monitoring ${newStatus ? "resumed" : "paused"}`
        )
      },
    },
    {
      label: getAutoStartMenuLabel(autoStartEnabled),
      enabled: process.platform === 'win32' || process.platform === 'darwin',
      click: () => {
        if (process.platform === 'win32' || process.platform === 'darwin') {
          const newStatus = !autoStartEnabled
          const result = setAutoStart(newStatus)
          if (result.success) {
            store.set("autoStartEnabled", newStatus)
            updateTrayMenu()
            const platformName = process.platform === 'darwin' ? 'macOS' : 'Windows'
            const startAction = newStatus ? `start with ${platformName}` : "not start automatically"
            const notificationBody = `Auto-start ${newStatus ? "enabled" : "disabled"}. App will ${startAction}.`

            if (process.platform === 'darwin') {
              showMacOSNotification("Auto-Start", notificationBody)
            } else {
              showNotification("Auto-Start", notificationBody)
            }
          } else if (process.platform === 'darwin') {
            showMacOSNotification("Auto-Start Error", result.error || "Failed to change auto-start setting.")
          } else {
            showNotification("Auto-Start Error", result.error || "Failed to change auto-start setting.")
          }
        }
      },
    },
    ...(process.platform === 'darwin' ? [{
      label: isBackgroundMode ? "Show in Dock" : "Hide from Dock",
      click: () => {
        const newBackgroundMode = !isBackgroundMode
        setMacOSAppBehavior(newBackgroundMode)
        updateTrayMenu()

        const message = newBackgroundMode
          ? "App hidden from dock. Access via menu bar only."
          : "App now visible in dock."
        showMacOSNotification("Dock Visibility", message, { silent: true })
      },
    }] : []),
    {
      label: "Settings",
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
          mainWindow.setSkipTaskbar(false) // Show in taskbar when visible
          // Show in dock on macOS when showing settings
          if (process.platform === 'darwin') {
            setMacOSAppBehavior(false)
          }
          mainWindow.webContents.send("show-settings")
        } else {
          createWindow()
        }
      },
    },
    { type: "separator" },
    {
      label: "About DropSentinel",
      click: () => {
        showAboutDialog()
      },
    },
    {
      label: "Quit DropSentinel",
      click: () => {
        app.quit()
      },
      accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q'
    },
  ]

  // Add keyboard shortcuts submenu for macOS
  if (process.platform === 'darwin') {
    menuTemplate.splice(-2, 0, {
      label: "Keyboard Shortcuts",
      submenu: [
        { label: "Quick Scan", accelerator: "Cmd+Shift+S", enabled: false },
        { label: "Toggle Dashboard", accelerator: "Cmd+Shift+D", enabled: false },
        { label: "Toggle Monitoring", accelerator: "Cmd+Shift+M", enabled: false }
      ]
    }, { type: "separator" })
  }

  const contextMenu = Menu.buildFromTemplate(menuTemplate)
  tray.setContextMenu(contextMenu)
}

function updateTrayTooltip() {
  const isMonitoring = store.get("isMonitoring", true)
  const stats = store.get("dashboardStats", { totalScans: 0, threatsDetected: 0 })
  const autoStartEnabled = getAutoStartStatus()

  const tooltip = `DropSentinel - Advanced File Security
Status: ${isMonitoring ? "Monitoring Active" : "Monitoring Paused"}
Auto-Start: ${autoStartEnabled ? "Enabled" : "Disabled"}
Scans Today: ${stats.totalScans}
Threats Detected: ${stats.threatsDetected}`

  tray.setToolTip(tooltip)
}

function showAboutDialog() {
  const aboutWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    minimizable: false,
    maximizable: false,
    modal: true,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  aboutWindow.setMenu(null)
  aboutWindow.loadURL(`data:text/html;charset=utf-8,
    <html>
      <head>
        <title>About DropSentinel</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 20px; background: #f5f5f5; text-align: center;
          }
          .logo { font-size: 48px; margin-bottom: 10px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #333; }
          .version { color: #666; margin-bottom: 20px; }
          .description { color: #555; line-height: 1.5; margin-bottom: 20px; }
          .footer { color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="logo">🛡️</div>
        <div class="title">DropSentinel</div>
        <div class="version">Version 1.0.0</div>
        <div class="description">
          Advanced file security with real-time protection.<br>
          Powered by VirusTotal's comprehensive threat detection.
        </div>
        <div class="footer">
          © 2024 DropSentinel. All rights reserved.
        </div>
      </body>
    </html>
  `)
}

function createWindow(startHidden = false) {
  const appIconPath = getIconPath("app-icon.png")

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    title: "DropSentinel",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: appIconPath || undefined,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    show: false,
    skipTaskbar: startHidden, // Hide from taskbar if starting hidden
    vibrancy: process.platform === "darwin" ? "under-window" : undefined, // macOS vibrancy effect
    transparent: process.platform === "darwin", // Enable transparency for macOS
    trafficLightPosition: process.platform === "darwin" ? { x: 20, y: 32 } : undefined, // macOS traffic lights
    fullscreenWindowTitle: process.platform === "darwin", // macOS fullscreen title
  })

  // Set up macOS-specific features
  if (process.platform === 'darwin') {
    setupMacOSKeyboardShortcuts()
    setupMacOSDragDrop()
    setupSpotlightIntegration()
  }

  // Determine the correct path for the HTML file
  let startUrl
  if (isDev) {
    startUrl = "http://localhost:3000"
  } else {
    // In production, the out directory should be at the app root level
    const appPath = app.getAppPath()
    const indexPath = path.join(appPath, "out", "index.html")
    startUrl = `file://${indexPath}`

    console.log(`[ELECTRON] App path: ${appPath}`)
    console.log(`[ELECTRON] Looking for index.html at: ${indexPath}`)

    // Verify the file exists
    if (!require('fs').existsSync(indexPath)) {
      console.error(`[ELECTRON] ERROR: index.html not found at ${indexPath}`)

      // Try alternative paths
      const alternatives = [
        path.join(__dirname, "../out/index.html"),
        path.join(__dirname, "out/index.html"),
        path.join(process.resourcesPath, "app", "out", "index.html"),
        path.join(process.resourcesPath, "out", "index.html")
      ]

      console.log(`[ELECTRON] Trying alternative paths:`)
      for (const altPath of alternatives) {
        console.log(`[ELECTRON] Checking: ${altPath}`)
        if (require('fs').existsSync(altPath)) {
          console.log(`[ELECTRON] ✅ Found index.html at: ${altPath}`)
          startUrl = `file://${altPath}`
          break
        }
      }

      // List available files for debugging
      try {
        console.log(`[ELECTRON] Available files in app directory:`)
        const appFiles = require('fs').readdirSync(appPath)
        appFiles.forEach(file => console.log(`  - ${file}`))

        if (require('fs').existsSync(path.join(appPath, "out"))) {
          console.log(`[ELECTRON] Available files in out directory:`)
          const outFiles = require('fs').readdirSync(path.join(appPath, "out"))
          outFiles.forEach(file => console.log(`  - ${file}`))
        }
      } catch (error) {
        console.error(`[ELECTRON] Could not list files: ${error.message}`)
      }
    }
  }

  console.log(`[ELECTRON] Loading URL: ${startUrl}`)
  console.log(`[ELECTRON] __dirname: ${__dirname}`)
  console.log(`[ELECTRON] isDev: ${isDev}`)
  console.log(`[ELECTRON] app.getAppPath(): ${app.getAppPath()}`)

  mainWindow.loadURL(startUrl)

  mainWindow.once("ready-to-show", () => {
    // Check if app was started with --hidden flag or should start hidden
    const shouldStartHidden = process.argv.includes('--hidden') ||
      process.argv.includes('--background') ||
      store.get('startMinimized', false) ||
      startHidden

    if (!shouldStartHidden) {
      mainWindow.show()

      // Show in dock on macOS when window is visible
      if (process.platform === 'darwin') {
        setMacOSAppBehavior(false)
      }

      // Show welcome screen if first time
      if (!store.get("hasSeenWelcome")) {
        mainWindow.webContents.send("show-welcome")
      }
    } else {
      console.log('[WINDOW] Starting hidden - app running in background')

      // Hide from dock on macOS when starting in background
      if (process.platform === 'darwin') {
        setMacOSAppBehavior(true)
      }

      // Still send welcome screen event if needed, even when hidden
      if (!store.get("hasSeenWelcome")) {
        mainWindow.webContents.send("show-welcome")
      }
    }
  })

  mainWindow.on("closed", () => {
    mainWindow = null
  })

  // Hide to tray instead of closing (Windows and macOS)
  mainWindow.on("close", (event) => {
    if (process.platform === "darwin" || process.platform === "win32") {
      event.preventDefault()
      mainWindow.hide()

      // Platform-specific behavior when hiding
      if (process.platform === "darwin") {
        // Hide from dock on macOS when window is closed
        setMacOSAppBehavior(true)
        showMacOSNotification(
          "DropSentinel",
          "App minimized to menu bar. File monitoring continues in background.",
          { silent: true }
        )
      } else if (process.platform === "win32") {
        showNotification(
          "DropSentinel",
          "App minimized to system tray. File monitoring continues in background."
        )
      }
    }
  })
}

function getDownloadsPath() {
  // Get platform-specific Downloads folder
  const platform = process.platform
  const homeDir = os.homedir()

  switch (platform) {
    case 'win32': {
      // Windows: Try multiple possible locations
      const winDownloads = [
        path.join(homeDir, 'Downloads'),
        path.join(homeDir, 'Desktop'),
        path.join(os.tmpdir(), 'Downloads')
      ]
      for (const downloadPath of winDownloads) {
        if (fs.existsSync(downloadPath)) {
          return downloadPath
        }
      }
      return winDownloads[0] // Default to first option
    }

    case 'darwin':
      // macOS: Standard Downloads folder
      return path.join(homeDir, 'Downloads')

    case 'linux': {
      // Linux: Try XDG user dirs first, then fallback
      const xdgDownloads = path.join(homeDir, 'Downloads')
      if (fs.existsSync(xdgDownloads)) {
        return xdgDownloads
      }
      return path.join(homeDir, 'Desktop')
    }

    default:
      return path.join(homeDir, 'Downloads')
  }
}

// Get all monitored folders (Downloads + custom folders)
function getMonitoredFolders() {
  const folders = [getDownloadsPath()] // Always include Downloads

  // Add custom monitored folders from settings
  const customFolders = store.get('monitoredFolders', [])
  customFolders.forEach(folder => {
    if (fs.existsSync(folder) && !folders.includes(folder)) {
      folders.push(folder)
    }
  })

  return folders
}

// Add/remove custom monitored folders
function addMonitoredFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    return { success: false, error: 'Folder does not exist' }
  }

  const customFolders = store.get('monitoredFolders', [])
  if (!customFolders.includes(folderPath)) {
    customFolders.push(folderPath)
    store.set('monitoredFolders', customFolders)

    // Restart file watcher to include new folder
    if (store.get("isMonitoring", true)) {
      startFileWatcher()
    }

    return { success: true }
  }

  return { success: false, error: 'Folder already monitored' }
}

function removeMonitoredFolder(folderPath) {
  const customFolders = store.get('monitoredFolders', [])
  const index = customFolders.indexOf(folderPath)

  if (index > -1) {
    customFolders.splice(index, 1)
    store.set('monitoredFolders', customFolders)

    // Restart file watcher to exclude removed folder
    if (store.get("isMonitoring", true)) {
      startFileWatcher()
    }

    return { success: true }
  }

  return { success: false, error: 'Folder not found in monitored list' }
}

function startFileWatcher() {
  if (fileWatcher) {
    fileWatcher.close()
  }

  // Get monitored folders (Downloads + custom folders)
  const monitoredFolders = getMonitoredFolders()
  console.log(`[FILE WATCHER] Monitoring ${monitoredFolders.length} folders:`, monitoredFolders)

  // Ensure all monitored directories exist
  const validFolders = []
  for (const folderPath of monitoredFolders) {
    if (!fs.existsSync(folderPath)) {
      console.log(`[FILE WATCHER] Folder does not exist: ${folderPath}`)
      if (folderPath === getDownloadsPath()) {
        try {
          fs.mkdirSync(folderPath, { recursive: true })
          console.log(`[FILE WATCHER] Created downloads folder: ${folderPath}`)
          validFolders.push(folderPath)
        } catch (error) {
          console.error(`[FILE WATCHER] Failed to create downloads folder:`, error)
        }
      }
    } else {
      validFolders.push(folderPath)
    }
  }

  if (validFolders.length === 0) {
    console.error('[FILE WATCHER] No valid folders to monitor')
    return
  }

  fileWatcher = chokidar.watch(validFolders, {
    ignored: [
      /(^|[/\\])\../, // ignore dotfiles
      /node_modules/, // ignore node_modules
      /\.git/, // ignore git directories
      /\.tmp$/, // ignore temp files
      /\.crdownload$/, // ignore chrome downloads (Chrome)
      /\.part$/, // ignore partial downloads (Firefox)
      /\.download$/, // ignore Safari downloads
      /\.opdownload$/, // ignore Opera downloads
      /~.*\.tmp$/, // ignore IE temp files
    ],
    persistent: true,
    ignoreInitial: true,
  })

  fileWatcher.on("add", (filePath) => {
    try {
      const fileName = path.basename(filePath)
      const timestamp = new Date().toISOString()
      console.log(`[FILE WATCHER] ${timestamp} - New file detected: ${fileName}`)
      console.log(`[FILE WATCHER] Full path: ${filePath}`)

      const fileStats = fs.statSync(filePath)
      console.log(`[FILE WATCHER] File size: ${fileStats.size} bytes (${formatFileSize(fileStats.size)})`)

      // Check file extension
      const fileExt = path.extname(fileName).toLowerCase()
      console.log(`[FILE WATCHER] File extension: ${fileExt}`)

      // Only scan files larger than 1KB and not temporary files
      if (fileStats.size > 1024 && !fileName.includes(".tmp") && !fileName.includes(".crdownload")) {
        console.log(`[FILE WATCHER] ✅ File qualifies for scanning: ${fileName}`)
        console.log(`[FILE WATCHER] Waiting 1 second before processing...`)
        setTimeout(() => {
          showFileDetectedDialog(filePath)
        }, 1000) // Wait 1 second to ensure file is fully downloaded
      } else {
        const reason = fileStats.size <= 1024 ? "too small" : "temporary file"
        console.log(`[FILE WATCHER] ❌ File skipped (${reason}): ${fileName}`)
      }
    } catch (error) {
      console.error(`[FILE WATCHER] Error processing file watcher event:`, error)
    }
  })

  fileWatcher.on("error", (error) => {
    console.error(`[FILE WATCHER] File watcher error:`, error)
  })

  fileWatcher.on("ready", () => {
    console.log(`[FILE WATCHER] File watcher is ready and monitoring ${validFolders.length} folders`)
  })

  console.log(`[FILE WATCHER] Starting to watch ${validFolders.length} folders:`, validFolders)
}

function stopFileWatcher() {
  if (fileWatcher) {
    fileWatcher.close()
    fileWatcher = null
    console.log("File watcher stopped")
  }
}

function showFileDetectedDialog(filePath) {
  try {
    const timestamp = new Date().toISOString()
    console.log(`[DETECTION] ${timestamp} - Processing detected file: ${filePath}`)

    const fileName = path.basename(filePath)
    const fileStats = fs.statSync(filePath)
    console.log(`[DETECTION] File name: ${fileName}`)
    console.log(`[DETECTION] File size: ${formatFileSize(fileStats.size)}`)

    // Create file data object with proper structure for the UI
    const fileData = {
      fileName: fileName,
      filePath: filePath,
      size: fileStats.size,
      timestamp: timestamp
    }

    // Always show native dialog first for unified workflow
    console.log(`[DETECTION] 💬 Showing native dialog first for: ${fileName}`)

    try {
      // Show system dialog directly (no main window focus)
      const dialogResult = dialog.showMessageBoxSync(null, {
        type: 'question',
        buttons: ['Scan Now', 'Skip'],
        defaultId: 0,
        cancelId: 1,
        title: 'New File Detected - DropSentinel',
        message: `A new file has been detected:\n\n${fileName}`,
        detail: `File path: ${filePath}\nFile size: ${formatFileSize(fileStats.size)}\n\nWould you like to scan this file for threats?`,
        icon: getIconPath("app-icon.png") || undefined,
        noLink: true,
        alwaysOnTop: true
      })

      // Only send to UI if user chose to scan (dialogResult is the button index, not an object)
      if (dialogResult === 0) {
        console.log(`[DETECTION] ✅ User chose to scan, focusing main window and starting UI-based scan`)

        // Focus the main window first
        if (mainWindow && !mainWindow.isDestroyed()) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
          mainWindow.show()
          mainWindow.setAlwaysOnTop(true)

          // Show in dock on macOS when showing window for scan
          if (process.platform === 'darwin') {
            setMacOSAppBehavior(false)
          }

          // Reset always on top after a short delay
          setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.setAlwaysOnTop(false)
            }
          }, 1000)

          // Send file detection event with autoScan flag for immediate UI-based scanning
          const autoScanData = {
            ...fileData,
            autoScan: true,
            skipPrompt: true // Skip any UI prompts and start scanning immediately
          }

          console.log(`[DETECTION] 📤 Sending auto-scan request to UI for: ${fileData.fileName}`)
          mainWindow.webContents.send("file-detected", autoScanData)
        }
      } else {
        console.log(`[DETECTION] ❌ User chose not to scan, ignoring file: ${fileName}`)
      }
    } catch (error) {
      console.error(`[DETECTION] ❌ Error showing dialog:`, error)
      // Fallback to notification only
      showNotification("File Detected", `New file detected: ${fileName}. Open DropSentinel to scan manually.`)
    }
  } catch (error) {
    console.error(`[DETECTION] ❌ Error in showFileDetectedDialog:`, error)
    showNotification("Error", `Failed to process detected file: ${path.basename(filePath)}`)
  }
}

function showNativeFileDialog(filePath, fileName, fileSize) {
  try {
    console.log(`[DIALOG] Attempting to show native dialog for: ${fileName}`)

    // Ensure main window exists and is ready
    if (!mainWindow || mainWindow.isDestroyed()) {
      console.log(`[DIALOG] ⚠️ Main window not available, showing notification instead`)
      showNotification("File Detected", `New file detected: ${fileName}. Open DropSentinel to scan.`)
      return
    }

    console.log(`[DIALOG] Main window is available, showing dialog...`)

    // Show the dialog
    const response = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Scan File', 'Ignore'],
      defaultId: 0,
      title: 'New File Detected - DropSentinel',
      message: `A new file has been downloaded: ${fileName}`,
      detail: `File size: ${formatFileSize(fileSize)}\n\nWould you like to scan this file for threats?`,
      noLink: true
    })

    console.log(`[DIALOG] User response: ${response === 0 ? 'SCAN' : 'IGNORE'}`)

    if (response === 0) {
      // User chose to scan - start scanning immediately
      console.log(`[DIALOG] ✅ User chose to scan: ${fileName}`)
      console.log(`[DIALOG] Starting automatic scan immediately...`)

      // Bring window to front first
      console.log(`[DIALOG] Bringing main window to front`)
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      mainWindow.show()

      // Removed auto-scan - now using unified UI-based scanning only
    } else {
      console.log(`[DIALOG] ❌ User chose to ignore: ${fileName}`)
    }
  } catch (error) {
    console.error(`[DIALOG] ❌ Error showing file dialog:`, error)
    // Fallback to notification
    showNotification("File Detected", `New file detected: ${fileName}. Open DropSentinel to scan.`)
  }
}

// Removed autoScanFile function - now using unified UI-based scanning only

function showNotification(title, body, onClick = null) {
  console.log(`[NOTIFICATION] Showing notification: "${title}" - "${body}"`)

  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: body,
      icon: getIconPath("app-icon.png") || undefined,
      silent: false
    })

    if (onClick) {
      console.log(`[NOTIFICATION] Notification has click handler attached`)
      notification.on('click', onClick)
    }

    notification.show()
    console.log(`[NOTIFICATION] ✅ Notification displayed successfully`)
  } else {
    console.log(`[NOTIFICATION] ❌ Notifications not supported on this platform`)
  }
}

function showScanResultsInApp(results) {
  console.log(`[RESULTS] Showing scan results in app for: ${results.fileName}`)

  if (mainWindow) {
    console.log(`[RESULTS] Main window available, bringing to front`)

    // Bring window to front and show results
    if (mainWindow.isMinimized()) {
      console.log(`[RESULTS] Restoring minimized window`)
      mainWindow.restore()
    }
    mainWindow.focus()
    mainWindow.show()

    // Send results to renderer
    console.log(`[RESULTS] Sending scan results to renderer process`)
    mainWindow.webContents.send("show-scan-results", results)
    console.log(`[RESULTS] ✅ Scan results sent successfully`)
  } else {
    console.log(`[RESULTS] ❌ Main window not available`)
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// IPC handlers
ipcMain.handle("get-store-value", (event, key) => {
  return store.get(key)
})

// Dashboard data handlers
ipcMain.handle("get-dashboard-stats", () => {
  const stats = store.get("dashboardStats", {
    totalScans: 0,
    threatsDetected: 0,
    filesQuarantined: 0,
    lastScan: null,
  })
  return stats
})

ipcMain.handle("get-recent-scans", () => {
  const recentScans = store.get("recentScans", [])
  return recentScans.slice(0, 10) // Return last 10 scans
})

ipcMain.handle("update-dashboard-stats", (event, newStats) => {
  const currentStats = store.get("dashboardStats", {
    totalScans: 0,
    threatsDetected: 0,
    filesQuarantined: 0,
    lastScan: null,
  })

  const updatedStats = { ...currentStats, ...newStats }
  store.set("dashboardStats", updatedStats)
  return updatedStats
})

ipcMain.handle("add-scan-result", (event, scanResult) => {
  const recentScans = store.get("recentScans", [])

  // Add new scan to the beginning
  recentScans.unshift({
    id: Date.now(),
    fileName: scanResult.fileName,
    scanDate: new Date().toISOString(),
    status: scanResult.positives > 0 ? "threat" : "clean",
    threats: scanResult.positives,
    filePath: scanResult.filePath,
    scanId: scanResult.scanId,
    permalink: scanResult.permalink
  })

  // Keep only last 50 scans
  if (recentScans.length > 50) {
    recentScans.splice(50)
  }

  store.set("recentScans", recentScans)

  // Update stats
  const currentStats = store.get("dashboardStats", {
    totalScans: 0,
    threatsDetected: 0,
    filesQuarantined: 0,
    lastScan: null,
  })

  const updatedStats = {
    ...currentStats,
    totalScans: currentStats.totalScans + 1,
    threatsDetected: currentStats.threatsDetected + (scanResult.positives > 0 ? 1 : 0),
    lastScan: new Date().toISOString()
  }

  store.set("dashboardStats", updatedStats)

  return { scanResult: recentScans[0], stats: updatedStats }
})

ipcMain.handle("get-monitoring-status", () => {
  return store.get("isMonitoring", true)
})

ipcMain.handle("set-monitoring-status", (event, status) => {
  console.log(`[MONITORING] Setting monitoring status to: ${status ? 'ENABLED' : 'DISABLED'}`)

  store.set("isMonitoring", status)
  if (status) {
    console.log(`[MONITORING] ✅ Starting file watcher...`)
    startFileWatcher()
  } else {
    console.log(`[MONITORING] ❌ Stopping file watcher...`)
    stopFileWatcher()
  }

  console.log(`[MONITORING] Monitoring status updated successfully`)
  return status
})

ipcMain.handle("set-store-value", (event, key, value) => {
  store.set(key, value)
})

// Auto-start IPC handlers
ipcMain.handle("get-auto-start-status", () => {
  return getAutoStartStatus()
})

ipcMain.handle("set-auto-start", (event, enable) => {
  const result = setAutoStart(enable)
  if (result.success) {
    store.set("autoStartEnabled", enable)
  }
  return result
})

// macOS-specific IPC handlers
ipcMain.handle("get-macos-app-behavior", () => {
  return getMacOSAppBehavior()
})

ipcMain.handle("set-macos-app-behavior", (event, backgroundMode) => {
  if (process.platform === 'darwin') {
    setMacOSAppBehavior(backgroundMode)
    return true
  }
  return false
})

// Enhanced drag & drop handler
ipcMain.handle("handle-drag-drop-files", async (event, filePaths) => {
  console.log('[DRAG-DROP] Received files:', filePaths)

  if (!filePaths || filePaths.length === 0) {
    return { success: false, error: 'No files provided' }
  }

  try {
    // Show app in dock when files are dropped
    if (process.platform === 'darwin') {
      setMacOSAppBehavior(false)
    }

    // Focus main window
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }

    // Process multiple files
    const results = []
    for (const filePath of filePaths) {
      try {
        const fileName = path.basename(filePath)
        const fileStats = fs.statSync(filePath)

        // Send file for scanning
        mainWindow.webContents.send("file-detected", {
          fileName,
          filePath,
          size: fileStats.size,
          timestamp: new Date().toISOString(),
          autoScan: true,
          skipPrompt: true,
          dragDrop: true
        })

        results.push({ filePath, success: true })
      } catch (error) {
        console.error('[DRAG-DROP] Error processing file:', filePath, error)
        results.push({ filePath, success: false, error: error.message })
      }
    }

    return { success: true, results }
  } catch (error) {
    console.error('[DRAG-DROP] Error handling drag & drop:', error)
    return { success: false, error: error.message }
  }
})

// Custom folder monitoring IPC handlers
ipcMain.handle("get-monitored-folders", () => {
  return getMonitoredFolders()
})

ipcMain.handle("add-monitored-folder", async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Folder to Monitor'
  })

  if (!result.canceled && result.filePaths.length > 0) {
    const folderPath = result.filePaths[0]
    return addMonitoredFolder(folderPath)
  }

  return { success: false, error: 'No folder selected' }
})

ipcMain.handle("remove-monitored-folder", (event, folderPath) => {
  return removeMonitoredFolder(folderPath)
})

ipcMain.handle("scan-file", async (event, filePath) => {
  const timestamp = new Date().toISOString()
  const fileName = path.basename(filePath)
  console.log(`[MANUAL-SCAN] ${timestamp} - Starting manual scan for: ${fileName}`)
  console.log(`[MANUAL-SCAN] File path: ${filePath}`)

  const apiKey = store.get("virusTotalApiKey")
  if (!apiKey) {
    console.log(`[MANUAL-SCAN] ❌ No VirusTotal API key configured`)
    throw new Error("VirusTotal API key not configured")
  }

  console.log(`[MANUAL-SCAN] ✅ API key found, proceeding with manual scan`)

  try {
    // Step 1: Upload file to VirusTotal (0-30%)
    console.log(`[MANUAL-SCAN] 📤 Step 1: Uploading file to VirusTotal...`)
    event.sender.send("scan-progress", { progress: 10, status: "Preparing file upload..." })
    const uploadResult = await uploadFileToVirusTotal(filePath, apiKey, (progress) => {
      event.sender.send("scan-progress", { progress: 10 + (progress * 0.2), status: "Uploading file..." })
    })

    console.log(`[MANUAL-SCAN] ✅ File uploaded successfully, analysis ID: ${uploadResult.data.id}`)
    event.sender.send("scan-progress", { progress: 30, status: "File uploaded, starting analysis..." })

    // Step 2: Poll for analysis results (30-90%)
    console.log(`[MANUAL-SCAN] 🔍 Step 2: Polling for analysis results...`)
    const analysisResult = await pollForAnalysisResults(uploadResult.data.id, apiKey, (progress) => {
      event.sender.send("scan-progress", { progress: 30 + (progress * 0.6), status: "Analyzing with antivirus engines..." })
    })

    console.log(`[MANUAL-SCAN] ✅ Analysis complete, processing results...`)
    event.sender.send("scan-progress", { progress: 95, status: "Processing results..." })

    // Step 3: Format results for the UI (90-100%)
    console.log(`[MANUAL-SCAN] 📊 Step 3: Formatting results for UI...`)
    const results = formatScanResults(analysisResult, path.basename(filePath))
    results.filePath = filePath // Add file path for dashboard
    console.log(`[MANUAL-SCAN] 📊 Scan results: ${results.positives} threats detected out of ${results.total} engines`)

    event.sender.send("scan-progress", { progress: 100, status: "Scan complete!" })

    // Save scan result to dashboard
    try {
      const recentScans = store.get("recentScans", [])

      // Add new scan to the beginning
      recentScans.unshift({
        id: Date.now(),
        fileName: results.fileName,
        scanDate: new Date().toISOString(),
        status: results.positives > 0 ? "threat" : "clean",
        threats: results.positives,
        filePath: filePath,
        scanId: results.scanId,
        permalink: results.permalink
      })

      // Keep only last 50 scans
      if (recentScans.length > 50) {
        recentScans.splice(50)
      }

      store.set("recentScans", recentScans)

      // Update stats
      const currentStats = store.get("dashboardStats", {
        totalScans: 0,
        threatsDetected: 0,
        filesQuarantined: 0,
        lastScan: null,
      })

      const updatedStats = {
        ...currentStats,
        totalScans: currentStats.totalScans + 1,
        threatsDetected: currentStats.threatsDetected + (results.positives > 0 ? 1 : 0),
        lastScan: new Date().toISOString()
      }

      store.set("dashboardStats", updatedStats)
      console.log(`[MANUAL-SCAN] 💾 Scan results saved to dashboard successfully`)
    } catch (error) {
      console.error(`[MANUAL-SCAN] ❌ Failed to save scan result:`, error)
    }

    console.log(`[MANUAL-SCAN] 🎉 Manual scan completed successfully for: ${fileName}`)
    return results
  } catch (error) {
    console.error(`[MANUAL-SCAN] ❌ VirusTotal scan error for ${fileName}:`, error)
    throw new Error(`Scan failed: ${error.message}`)
  }
})

ipcMain.handle("delete-file", async (event, filePath) => {
  try {
    await fs.promises.unlink(filePath)
    return true
  } catch (error) {
    console.error(`[DELETE-FILE] Failed to delete file: ${filePath}`, error)
    return false
  }
})

ipcMain.handle("show-file-in-folder", (event, filePath) => {
  shell.showItemInFolder(filePath)
})

// File selection handlers
ipcMain.handle("select-files", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      {
        name: 'Executables',
        extensions: [
          // Windows
          'exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'pif',
          // macOS
          'dmg', 'pkg', 'app', 'command',
          // Linux
          'deb', 'rpm', 'appimage', 'snap', 'flatpak', 'run', 'sh'
        ]
      },
      {
        name: 'Archives',
        extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'cab', 'iso']
      },
      {
        name: 'Documents',
        extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf']
      },
      {
        name: 'Scripts',
        extensions: ['js', 'py', 'rb', 'pl', 'php', 'jar', 'vbs', 'ps1']
      }
    ]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths.map(filePath => {
      const stats = fs.statSync(filePath)
      return {
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        type: path.extname(filePath)
      }
    })
  }
  return []
})

ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

// Native notification handlers
ipcMain.handle("show-notification", async (event, options) => {
  try {
    console.log(`[NOTIFICATION-API] Showing notification: "${options.title}"`)

    if (Notification.isSupported()) {
      const notification = new Notification({
        title: options.title,
        body: options.body,
        icon: options.icon || getIconPath("app-icon.png") || undefined,
        silent: false,
        urgency: options.urgency || 'normal'
      })

      notification.show()
      console.log(`[NOTIFICATION-API] ✅ Notification displayed successfully`)
      return true
    } else {
      console.log(`[NOTIFICATION-API] ❌ Notifications not supported on this platform`)
      return false
    }
  } catch (error) {
    console.error(`[NOTIFICATION-API] ❌ Error showing notification:`, error)
    return false
  }
})

// File detection dialog handler
ipcMain.handle("show-file-detection-dialog", async (event, options) => {
  try {
    console.log(`[DIALOG-API] Showing file detection dialog for: ${options.message}`)

    if (!mainWindow || mainWindow.isDestroyed()) {
      console.log(`[DIALOG-API] ❌ Main window not available`)
      return { response: 1 } // Default to "Skip"
    }

    // Show dialog WITHOUT focusing the main window first
    // This ensures only the dialog is focused and on top
    const response = dialog.showMessageBoxSync(null, {
      type: options.type || 'question',
      buttons: options.buttons || ['Scan Now', 'Skip'],
      defaultId: options.defaultId || 0,
      cancelId: options.cancelId || 1,
      title: options.title || 'New File Detected - DropSentinel',
      message: options.message,
      detail: 'Would you like to scan this file for threats?',
      icon: options.icon ? path.join(__dirname, options.icon) : getIconPath("app-icon.png") || undefined,
      noLink: true,
      alwaysOnTop: true
    })

    console.log(`[DIALOG-API] User response: ${response} (${options.buttons[response]})`)

    // If user chose to scan (response === 0), focus the main window
    if (response === 0) {
      console.log(`[DIALOG-API] User chose to scan, focusing main window`)
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      mainWindow.show()
      mainWindow.setAlwaysOnTop(true)

      // Reset always on top after a short delay
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.setAlwaysOnTop(false)
        }
      }, 1000)
    }

    return { response }
  } catch (error) {
    console.error(`[DIALOG-API] ❌ Error showing file detection dialog:`, error)
    return { response: 1 } // Default to "Skip" on error
  }
})

// Quarantine functionality - Cross-platform data directory
function getQuarantineDir() {
  const platform = process.platform
  const homeDir = os.homedir()

  switch (platform) {
    case 'win32':
      // Windows: Use AppData/Local
      return path.join(homeDir, 'AppData', 'Local', 'DropSentinel', 'quarantine')

    case 'darwin':
      // macOS: Use Application Support
      return path.join(homeDir, 'Library', 'Application Support', 'DropSentinel', 'quarantine')

    case 'linux': {
      // Linux: Use XDG data directory
      const xdgDataHome = process.env.XDG_DATA_HOME || path.join(homeDir, '.local', 'share')
      return path.join(xdgDataHome, 'DropSentinel', 'quarantine')
    }

    default:
      // Fallback for other platforms
      return path.join(homeDir, '.dropsentinel', 'quarantine')
  }
}

const quarantineDir = getQuarantineDir()

// Ensure quarantine directory exists
function ensureQuarantineDir() {
  try {
    if (!fs.existsSync(quarantineDir)) {
      fs.mkdirSync(quarantineDir, { recursive: true })
      console.log(`[QUARANTINE] Created quarantine directory: ${quarantineDir}`)
    }
    return true
  } catch (error) {
    console.error(`[QUARANTINE] Failed to create quarantine directory:`, error)
    return false
  }
}

ipcMain.handle("quarantine-file", async (event, options) => {
  try {
    console.log(`[QUARANTINE] Quarantining file: ${options.filePath}`)

    if (!ensureQuarantineDir()) {
      throw new Error('Failed to create quarantine directory')
    }

    const originalPath = options.filePath
    const fileName = path.basename(originalPath)
    const quarantineId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const quarantinePath = path.join(quarantineDir, `${quarantineId}_${fileName}`)

    // Move file to quarantine
    fs.renameSync(originalPath, quarantinePath)

    // Save quarantine metadata
    const metadata = {
      id: quarantineId,
      originalPath,
      quarantinePath,
      fileName,
      threatInfo: options.threatInfo,
      timestamp: options.timestamp,
      status: 'quarantined'
    }

    const metadataPath = path.join(quarantineDir, `${quarantineId}.json`)
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

    console.log(`[QUARANTINE] ✅ File quarantined successfully: ${quarantinePath}`)

    return {
      success: true,
      quarantinePath,
      quarantineId
    }
  } catch (error) {
    console.error(`[QUARANTINE] ❌ Error quarantining file:`, error)
    return {
      success: false,
      error: error.message
    }
  }
})

ipcMain.handle("get-quarantined-files", async () => {
  try {
    if (!fs.existsSync(quarantineDir)) {
      return []
    }

    const files = fs.readdirSync(quarantineDir)
    const metadataFiles = files.filter(file => file.endsWith('.json'))

    const quarantinedFiles = metadataFiles.map(metadataFile => {
      try {
        const metadataPath = path.join(quarantineDir, metadataFile)
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))

        // Check if quarantined file still exists
        const fileExists = fs.existsSync(metadata.quarantinePath)

        return {
          ...metadata,
          fileExists
        }
      } catch (error) {
        console.error(`[QUARANTINE] Error reading metadata for ${metadataFile}:`, error)
        return null
      }
    }).filter(Boolean)

    return quarantinedFiles
  } catch (error) {
    console.error(`[QUARANTINE] Error getting quarantined files:`, error)
    return []
  }
})

ipcMain.handle("restore-quarantined-file", async (event, options) => {
  try {
    const metadataPath = path.join(quarantineDir, `${options.quarantineId}.json`)

    if (!fs.existsSync(metadataPath)) {
      throw new Error('Quarantine metadata not found')
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))

    if (!fs.existsSync(metadata.quarantinePath)) {
      throw new Error('Quarantined file not found')
    }

    // Restore file to original location or specified path
    const restorePath = options.originalPath || metadata.originalPath
    fs.renameSync(metadata.quarantinePath, restorePath)

    // Update metadata
    metadata.status = 'restored'
    metadata.restoredAt = new Date().toISOString()
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

    console.log(`[QUARANTINE] ✅ File restored: ${restorePath}`)

    return { success: true }
  } catch (error) {
    console.error(`[QUARANTINE] ❌ Error restoring file:`, error)
    return {
      success: false,
      error: error.message
    }
  }
})

ipcMain.handle("delete-quarantined-file", async (event, quarantineId) => {
  try {
    const metadataPath = path.join(quarantineDir, `${quarantineId}.json`)

    if (!fs.existsSync(metadataPath)) {
      throw new Error('Quarantine metadata not found')
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))

    // Delete quarantined file if it exists
    if (fs.existsSync(metadata.quarantinePath)) {
      fs.unlinkSync(metadata.quarantinePath)
    }

    // Delete metadata
    fs.unlinkSync(metadataPath)

    console.log(`[QUARANTINE] ✅ Quarantined file permanently deleted: ${quarantineId}`)

    return { success: true }
  } catch (error) {
    console.error(`[QUARANTINE] ❌ Error deleting quarantined file:`, error)
    return {
      success: false,
      error: error.message
    }
  }
})

ipcMain.handle("get-quarantine-stats", async () => {
  try {
    if (!fs.existsSync(quarantineDir)) {
      return {
        totalQuarantined: 0,
        totalRestored: 0,
        totalDeleted: 0,
        diskSpaceUsed: 0
      }
    }

    const files = fs.readdirSync(quarantineDir)
    const metadataFiles = files.filter(file => file.endsWith('.json'))

    let totalQuarantined = 0
    let totalRestored = 0
    let diskSpaceUsed = 0

    metadataFiles.forEach(metadataFile => {
      try {
        const metadataPath = path.join(quarantineDir, metadataFile)
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))

        if (metadata.status === 'quarantined') {
          totalQuarantined++

          // Calculate disk space used
          if (fs.existsSync(metadata.quarantinePath)) {
            const stats = fs.statSync(metadata.quarantinePath)
            diskSpaceUsed += stats.size
          }
        } else if (metadata.status === 'restored') {
          totalRestored++
        }
      } catch (error) {
        console.error(`[QUARANTINE] Error reading metadata for ${metadataFile}:`, error)
      }
    })

    return {
      totalQuarantined,
      totalRestored,
      totalDeleted: 0, // We don't track deleted files
      diskSpaceUsed
    }
  } catch (error) {
    console.error(`[QUARANTINE] Error getting quarantine stats:`, error)
    return {
      totalQuarantined: 0,
      totalRestored: 0,
      totalDeleted: 0,
      diskSpaceUsed: 0
    }
  }
})

ipcMain.handle("cleanup-quarantine", async (event, daysOld) => {
  try {
    if (!fs.existsSync(quarantineDir)) {
      return { success: true, cleaned: 0 }
    }

    const files = fs.readdirSync(quarantineDir)
    const metadataFiles = files.filter(file => file.endsWith('.json'))
    const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000))

    let cleaned = 0

    metadataFiles.forEach(metadataFile => {
      try {
        const metadataPath = path.join(quarantineDir, metadataFile)
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
        const quarantineDate = new Date(metadata.timestamp)

        if (quarantineDate < cutoffDate) {
          // Delete old quarantined file and metadata
          if (fs.existsSync(metadata.quarantinePath)) {
            fs.unlinkSync(metadata.quarantinePath)
          }
          fs.unlinkSync(metadataPath)
          cleaned++
        }
      } catch (error) {
        console.error(`[QUARANTINE] Error cleaning up ${metadataFile}:`, error)
      }
    })

    console.log(`[QUARANTINE] ✅ Cleaned up ${cleaned} old files`)

    return { success: true, cleaned }
  } catch (error) {
    console.error(`[QUARANTINE] Error during cleanup:`, error)
    return {
      success: false,
      error: error.message,
      cleaned: 0
    }
  }
})

ipcMain.handle("is-quarantine-available", async () => {
  try {
    return ensureQuarantineDir()
  } catch (error) {
    console.error(`[QUARANTINE] Error checking quarantine availability:`, error)
    return false
  }
})

// Open external URL handler
ipcMain.handle("open-external", async (event, url) => {
  try {
    console.log(`[EXTERNAL] Opening URL: ${url}`)
    await shell.openExternal(url)
    return true
  } catch (error) {
    console.error(`[EXTERNAL] Error opening URL:`, error)
    return false
  }
})

// Error logging and crash reporting
ipcMain.handle("log-error", async (event, errorData) => {
  try {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      type: 'renderer-error',
      ...errorData
    }

    // Log to console
    console.error(`[CRASH-REPORT] ${timestamp} - Renderer Error:`, errorData)

    // Save to crash log file
    const crashLogPath = path.join(os.homedir(), '.dropsentinel', 'crash-logs')
    if (!fs.existsSync(crashLogPath)) {
      fs.mkdirSync(crashLogPath, { recursive: true })
    }

    const logFile = path.join(crashLogPath, `crash-${timestamp.replace(/[:.]/g, '-')}.json`)
    fs.writeFileSync(logFile, JSON.stringify(logEntry, null, 2))

    // Store in electron-store for later reporting
    const crashLogs = store.get('crashLogs', [])
    crashLogs.unshift(logEntry)

    // Keep only last 50 crash logs
    if (crashLogs.length > 50) {
      crashLogs.splice(50)
    }

    store.set('crashLogs', crashLogs)

    console.log(`[CRASH-REPORT] Error logged to: ${logFile}`)
    return true
  } catch (error) {
    console.error(`[CRASH-REPORT] Failed to log error:`, error)
    return false
  }
})

// Get crash logs for debugging
ipcMain.handle("get-crash-logs", async () => {
  try {
    return store.get('crashLogs', [])
  } catch (error) {
    console.error(`[CRASH-REPORT] Failed to get crash logs:`, error)
    return []
  }
})

// Clear crash logs
ipcMain.handle("clear-crash-logs", async () => {
  try {
    store.delete('crashLogs')

    // Also clear crash log files
    const crashLogPath = path.join(os.homedir(), '.dropsentinel', 'crash-logs')
    if (fs.existsSync(crashLogPath)) {
      const files = fs.readdirSync(crashLogPath)
      files.forEach(file => {
        if (file.startsWith('crash-') && file.endsWith('.json')) {
          fs.unlinkSync(path.join(crashLogPath, file))
        }
      })
    }

    return true
  } catch (error) {
    console.error(`[CRASH-REPORT] Failed to clear crash logs:`, error)
    return false
  }
})

// Advanced logging system
ipcMain.handle("log-advanced", async (event, logEntry) => {
  try {
    const timestamp = new Date().toISOString()
    const enhancedEntry = {
      ...logEntry,
      processType: 'main',
      pid: process.pid,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }

    // Console output with enhanced formatting
    const prefix = `[${timestamp}] [${logEntry.level.toUpperCase()}] [${logEntry.category}]`
    console.log(`${prefix} ${logEntry.message}`, logEntry.data || '')

    // Save to structured log file
    const logDir = path.join(os.homedir(), '.dropsentinel', 'logs')
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }

    // Daily log rotation
    const today = new Date().toISOString().split('T')[0]
    const logFile = path.join(logDir, `dropsentinel-${today}.log`)

    const logLine = JSON.stringify(enhancedEntry) + '\n'
    fs.appendFileSync(logFile, logLine)

    // Store in memory for analytics (keep last 500 entries)
    const recentLogs = store.get('recentLogs', [])
    recentLogs.unshift(enhancedEntry)

    if (recentLogs.length > 500) {
      recentLogs.splice(500)
    }

    store.set('recentLogs', recentLogs)

    // Cleanup old log files (keep last 30 days)
    cleanupOldLogs(logDir)

    return true
  } catch (error) {
    console.error(`[ADVANCED-LOG] Failed to log entry:`, error)
    return false
  }
})

// Get advanced logs for analytics
ipcMain.handle("get-advanced-logs", async (event, criteria = {}) => {
  try {
    const recentLogs = store.get('recentLogs', [])

    let filteredLogs = [...recentLogs]

    if (criteria.level) {
      filteredLogs = filteredLogs.filter(log => log.level === criteria.level)
    }

    if (criteria.category) {
      filteredLogs = filteredLogs.filter(log => log.category === criteria.category)
    }

    if (criteria.since) {
      const sinceDate = new Date(criteria.since)
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= sinceDate)
    }

    if (criteria.limit) {
      filteredLogs = filteredLogs.slice(0, criteria.limit)
    }

    return filteredLogs
  } catch (error) {
    console.error(`[ADVANCED-LOG] Failed to get logs:`, error)
    return []
  }
})

// Clear advanced logs
ipcMain.handle("clear-advanced-logs", async () => {
  try {
    store.delete('recentLogs')

    // Also clear log files
    const logDir = path.join(os.homedir(), '.dropsentinel', 'logs')
    if (fs.existsSync(logDir)) {
      const files = fs.readdirSync(logDir)
      files.forEach(file => {
        if (file.startsWith('dropsentinel-') && file.endsWith('.log')) {
          fs.unlinkSync(path.join(logDir, file))
        }
      })
    }

    return true
  } catch (error) {
    console.error(`[ADVANCED-LOG] Failed to clear logs:`, error)
    return false
  }
})

// Helper function to cleanup old log files
function cleanupOldLogs(logDir) {
  try {
    const files = fs.readdirSync(logDir)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    files.forEach(file => {
      if (file.startsWith('dropsentinel-') && file.endsWith('.log')) {
        const filePath = path.join(logDir, file)
        const stats = fs.statSync(filePath)

        if (stats.mtime < thirtyDaysAgo) {
          fs.unlinkSync(filePath)
          console.log(`[LOG-CLEANUP] Removed old log file: ${file}`)
        }
      }
    })
  } catch (error) {
    console.error(`[LOG-CLEANUP] Failed to cleanup old logs:`, error)
  }
}

ipcMain.handle("get-files-in-folder", async (event, folderPath) => {
  try {
    const files = fs.readdirSync(folderPath)
    return files
      .filter(file => {
        const filePath = path.join(folderPath, file)
        const stats = fs.statSync(filePath)
        return stats.isFile() && stats.size > 0
      })
      .map(file => {
        const filePath = path.join(folderPath, file)
        const stats = fs.statSync(filePath)
        return {
          name: file,
          path: filePath,
          size: stats.size,
          type: path.extname(file)
        }
      })
      .slice(0, 50) // Limit to 50 files
  } catch (error) {
    console.error("Failed to read folder:", error)
    return []
  }
})

ipcMain.handle("clear-scan-history", async () => {
  try {
    store.delete("recentScans")

    // Update dashboard stats to reset scan count
    const currentStats = store.get("dashboardStats", {
      totalScans: 0,
      threatsDetected: 0,
      filesQuarantined: 0,
      lastScan: null,
    })

    const updatedStats = {
      ...currentStats,
      totalScans: 0,
      threatsDetected: 0,
      lastScan: null
    }

    store.set("dashboardStats", updatedStats)
    return true
  } catch (error) {
    console.error("Failed to clear scan history:", error)
    return false
  }
})

ipcMain.handle("clear-all-data", async () => {
  try {
    store.delete("dashboardStats")
    store.delete("recentScans")
    store.delete("appSettings")
    return true
  } catch (error) {
    console.error("Failed to clear data:", error)
    return false
  }
})

async function initializeApp() {
  // Set proper app name for notifications and system integration
  app.setName("DropSentinel")

  // Set app user model ID for Windows notifications
  if (process.platform === 'win32') {
    app.setAppUserModelId("com.jsb2010.dropsentinel")
  }

  // Dynamically import electron-store
  const { default: ElectronStore } = await import("electron-store")
  Store = ElectronStore
  store = new Store()

  // Check if app should start hidden
  const shouldStartHidden = process.argv.includes('--hidden') ||
    process.argv.includes('--background') ||
    store.get('startMinimized', false)

  console.log(`[INIT] Starting app ${shouldStartHidden ? 'hidden' : 'visible'}`)

  // Initialize macOS-specific features
  if (process.platform === 'darwin') {
    setupNotificationCenter()
  }

  createTray()
  createWindow(shouldStartHidden)
  startFileWatcher()

  // Show startup notification if starting hidden
  if (shouldStartHidden) {
    setTimeout(() => {
      if (process.platform === 'darwin') {
        showMacOSNotification(
          "DropSentinel Started",
          "File monitoring is active. App is running in the menu bar.",
          { silent: true }
        )
      } else {
        showNotification(
          "DropSentinel Started",
          "File monitoring is active. App is running in the background."
        )
      }
    }, 2000) // Delay to ensure tray is ready
  }
}

app.whenReady().then(initializeApp)

app.on("window-all-closed", () => {
  // Don't quit the app when all windows are closed - keep running in background
  if (process.platform === "darwin") {
    // On macOS, hide from dock but keep running in menu bar
    setMacOSAppBehavior(true)
    console.log('[APP] All windows closed on macOS, continuing to run in menu bar')
    return
  }
  // On Windows/Linux, keep running in system tray
  console.log('[APP] All windows closed, continuing to run in background')
})

app.on("activate", () => {
  // On macOS, show window when app icon is clicked in dock (if visible)
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  } else if (mainWindow && process.platform === "darwin") {
    // Show existing window and dock icon
    mainWindow.show()
    setMacOSAppBehavior(false)
  }
})

app.on("before-quit", () => {
  if (fileWatcher) {
    fileWatcher.close()
  }
})
