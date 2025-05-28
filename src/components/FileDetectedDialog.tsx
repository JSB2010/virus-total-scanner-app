"use client"

import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertTriangle,
  Shield,
  Scan,
  X,
  Clock,
  HardDrive,
  Eye,
  Download
} from "lucide-react"

interface FileDetectedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileData: {
    fileName: string
    filePath: string
    size: number
    timestamp: string
  } | null
  onScan: () => void
}

export function FileDetectedDialog({
  open,
  onOpenChange,
  fileData,
  onScan
}: Readonly<FileDetectedDialogProps>) {
  if (!fileData) return null

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop()
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'ico', 'heic', 'heif']
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp', 'ogv']
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus']
    const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'lzma', 'cab', 'iso']
    const executableExts = [
      // Windows executables
      'exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'pif', 'vbs', 'ps1',
      // macOS executables
      'dmg', 'pkg', 'app', 'command',
      // Linux executables
      'deb', 'rpm', 'appimage', 'snap', 'flatpak', 'run', 'sh'
    ]

    if (imageExts.includes(ext ?? '')) return '🖼️'
    if (videoExts.includes(ext ?? '')) return '🎥'
    if (audioExts.includes(ext ?? '')) return '🎵'
    if (archiveExts.includes(ext ?? '')) return '📦'
    if (executableExts.includes(ext ?? '')) return '⚙️'
    return '📄'
  }

  const getRiskLevel = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop()

    // High risk: Executable files across all platforms
    const highRisk = [
      // Windows high-risk
      'exe', 'bat', 'cmd', 'scr', 'pif', 'com', 'msi', 'vbs', 'ps1', 'reg', 'hta',
      // macOS high-risk
      'app', 'command', 'workflow',
      // Linux high-risk
      'sh', 'run', 'bin',
      // Cross-platform scripts
      'jar', 'py', 'rb', 'pl', 'php'
    ]

    // Medium risk: Archives and installers
    const mediumRisk = [
      // Archives
      'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'cab', 'iso',
      // Platform installers
      'dmg', 'pkg', 'deb', 'rpm', 'appimage', 'snap', 'flatpak',
      // Documents with macros
      'docm', 'xlsm', 'pptm'
    ]

    if (highRisk.includes(ext ?? '')) return { level: 'high', color: 'bg-red-100 text-red-800 border-red-200' }
    if (mediumRisk.includes(ext ?? '')) return { level: 'medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    return { level: 'low', color: 'bg-green-100 text-green-800 border-green-200' }
  }

  const risk = getRiskLevel(fileData.fileName)

  const handleScan = () => {
    onScan()
    onOpenChange(false)
  }

  const handleIgnore = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-2xl">
        <DialogHeader className="pb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                New File Detected
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                A new file has been downloaded to your system
              </DialogDescription>
            </div>
          </motion.div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* File Information Card */}
          <Card className="glass border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">
                  {getFileIcon(fileData.fileName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2 break-all">
                    {fileData.fileName}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <HardDrive className="w-4 h-4" />
                      <span>{formatFileSize(fileData.size)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(fileData.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge variant="outline" className={`${risk.color} border`}>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)} Risk
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card className="glass border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Security Scan Recommended
                  </h4>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Scan with 70+ antivirus engines</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Real-time threat detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Comprehensive security analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleIgnore}
              variant="outline"
              className="flex-1 bg-white/50 hover:bg-white/70 border-white/20"
            >
              <X className="w-4 h-4 mr-2" />
              Ignore
            </Button>
            <Button
              onClick={handleScan}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg"
            >
              <Scan className="w-4 h-4 mr-2" />
              Scan Now
            </Button>
          </div>

          {/* Quick Info */}
          <div className="text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <Eye className="w-3 h-3" />
              <span>Scanning is secure and private - files are analyzed safely</span>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
