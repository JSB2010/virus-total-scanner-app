"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileText,
  X,
  Scan,
  FolderOpen,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"

interface ManualScanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanFile: (filePath: string) => void
}

interface SelectedFile {
  name: string
  path: string
  size: number
  type: string
}

export function ManualScanDialog({ open, onOpenChange, onScanFile }: ManualScanDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async () => {
    try {
      const files = await window.electronAPI.selectFiles()
      if (files && files.length > 0) {
        const newFiles = files.map((file: any) => ({
          name: file.name,
          path: file.path,
          size: file.size,
          type: file.type || 'unknown'
        }))
        setSelectedFiles(prev => [...prev, ...newFiles])
      }
    } catch (error) {
      console.error("Failed to select files:", error)
    }
  }

  const handleFolderSelect = async () => {
    try {
      const folderPath = await window.electronAPI.selectFolder()
      if (folderPath) {
        const files = await window.electronAPI.getFilesInFolder(folderPath)
        if (files && files.length > 0) {
          const newFiles = files.map((file: any) => ({
            name: file.name,
            path: file.path,
            size: file.size,
            type: file.type || 'unknown'
          }))
          setSelectedFiles(prev => [...prev, ...newFiles])
        }
      }
    } catch (error) {
      console.error("Failed to select folder:", error)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const scanFile = (filePath: string) => {
    // Remove the file from the list
    setSelectedFiles(prev => prev.filter(file => file.path !== filePath))
    onScanFile(filePath)
  }

  const scanAllFiles = () => {
    selectedFiles.forEach((file, index) => {
      setTimeout(() => onScanFile(file.path), index * 100)
    })
    // Clear the list after initiating all scans
    setSelectedFiles([])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️'
    if (type.includes('video')) return '🎥'
    if (type.includes('audio')) return '🎵'
    if (type.includes('pdf')) return '📄'
    if (type.includes('zip') || type.includes('rar')) return '📦'
    if (type.includes('executable') || type.includes('exe')) return '⚙️'
    return '📄'
  }

  const getThreatLevel = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop()
    const highRisk = ['exe', 'bat', 'cmd', 'scr', 'pif', 'com']
    const mediumRisk = ['zip', 'rar', '7z', 'tar', 'gz']

    if (highRisk.includes(ext || '')) return 'high'
    if (mediumRisk.includes(ext || '')) return 'medium'
    return 'low'
  }

  const getThreatBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Risk</Badge>
      case 'medium':
        return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Medium Risk</Badge>
      default:
        return <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Low Risk</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-[90vw] max-h-[85vh] m-4 overflow-hidden border-0 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-2xl rounded-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white rounded-t-2xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Manual File Scanner
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base">
                Select files or folders to scan for threats using VirusTotal's advanced detection
              </DialogDescription>
            </div>
          </motion.div>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[calc(85vh-200px)]">
          {/* Ultra-Modern Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <Card
              className={`border-2 border-dashed transition-all duration-500 backdrop-blur-sm ${
                isDragOver
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/30 shadow-2xl scale-105 rotate-1'
                  : 'border-slate-300/50 dark:border-slate-600/50 hover:border-blue-400/70 dark:hover:border-blue-500/70 bg-white/50 dark:bg-slate-800/50 hover:shadow-xl'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                // Handle file drop
              }}
            >
              <CardContent className="p-10 text-center">
                <motion.div
                  animate={{
                    scale: isDragOver ? 1.05 : 1,
                    y: isDragOver ? -5 : 0
                  }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="relative">
                    <motion.div
                      animate={{
                        rotate: isDragOver ? 360 : 0,
                        scale: isDragOver ? 1.2 : 1
                      }}
                      transition={{ duration: 0.5 }}
                      className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${
                        isDragOver
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Upload className="w-10 h-10" />
                    </motion.div>
                    {isDragOver && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 rounded-2xl bg-blue-500/20 border-2 border-blue-500 border-dashed"
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                      {isDragOver ? 'Drop files here' : 'Select Files to Scan'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {isDragOver
                        ? 'Release to add files for scanning'
                        : 'Choose individual files or entire folders for comprehensive security analysis'
                      }
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handleFileSelect}
                        variant="outline"
                        className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border-blue-300/50 dark:border-blue-600/50 h-12 px-6 font-medium shadow-lg backdrop-blur-sm"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Select Files
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handleFolderSelect}
                        variant="outline"
                        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-300/50 dark:border-purple-600/50 h-12 px-6 font-medium shadow-lg backdrop-blur-sm"
                      >
                        <FolderOpen className="w-5 h-5 mr-2" />
                        Select Folder
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Selected Files */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="glass border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">Selected Files</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} ready for scanning
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={scanAllFiles}
                          size="sm"
                          disabled={selectedFiles.length === 0}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md"
                        >
                          <Scan className="w-4 h-4 mr-2" />
                          Scan All ({selectedFiles.length})
                        </Button>
                        <Button
                          onClick={() => setSelectedFiles([])}
                          variant="outline"
                          size="sm"
                          className="bg-white/50 hover:bg-white/70 border-white/20"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                      <AnimatePresence>
                        {selectedFiles.map((file, index) => (
                          <motion.div
                            key={`${file.path}-${index}`}
                            initial={{ opacity: 0, height: 0, x: -20 }}
                            animate={{ opacity: 1, height: "auto", x: 0 }}
                            exit={{ opacity: 0, height: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/20 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="text-3xl flex-shrink-0">
                                {getFileIcon(file.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate text-slate-900 dark:text-slate-100">
                                  {file.name}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                  <span>{formatFileSize(file.size)}</span>
                                  <span>•</span>
                                  <span className="truncate">{file.type}</span>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {getThreatBadge(getThreatLevel(file.name))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                onClick={() => scanFile(file.path)}
                                size="sm"
                                variant="outline"
                                className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
                              >
                                <Scan className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => removeFile(index)}
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="glass border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      Advanced Threat Detection
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>70+ antivirus engines analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Real-time threat intelligence</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Comprehensive scan history</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Instant security alerts</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Note:</strong> Large files may take longer to process. All scan results are encrypted and stored locally for your privacy.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Ultra-Modern Footer */}
        <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 rounded-b-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-between items-center"
          >
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {selectedFiles.length > 0 ? (
                <motion.span
                  className="flex items-center gap-2"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <motion.div
                    className="w-3 h-3 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="font-medium">
                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} ready for scanning
                  </span>
                </motion.span>
              ) : (
                <span>Select files to begin security analysis</span>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-white hover:bg-slate-50 border-slate-300 px-6"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
