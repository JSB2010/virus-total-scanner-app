"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Shield,
  FileText,
  Upload,
  Search,
  CheckCircle2,
  Globe,
  Zap,
  Eye,
  Clock
} from "lucide-react"

interface ScanProgressDialogProps {
  open: boolean
  progress: number
  fileName?: string
  status?: string
}

export function ScanProgressDialog({ open, progress, fileName, status }: Readonly<ScanProgressDialogProps>) {
  const getProgressStage = (progress: number) => {
    if (progress < 30) return { stage: 'upload', icon: Upload, text: 'Uploading to VirusTotal' }
    if (progress < 60) return { stage: 'analyze', icon: Search, text: 'Analyzing with 70+ engines' }
    if (progress < 90) return { stage: 'process', icon: Zap, text: 'Processing results' }
    return { stage: 'complete', icon: CheckCircle2, text: 'Finalizing scan' }
  }

  const currentStage = getProgressStage(progress)
  const StageIcon = currentStage.icon

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-2xl max-w-[90vw] max-h-[85vh] m-4 border-0 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-2xl rounded-2xl overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-xl border border-white/30"
          >
            <motion.div
              animate={{ rotate: currentStage.stage === 'complete' ? 0 : 360 }}
              transition={{
                duration: currentStage.stage === 'complete' ? 0 : 3,
                repeat: currentStage.stage === 'complete' ? 0 : Infinity,
                ease: "linear"
              }}
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>
          <DialogTitle className="text-2xl font-bold text-white">
            Scanning in Progress
          </DialogTitle>
          <DialogDescription className="text-white/90 text-base">
            Advanced threat detection powered by VirusTotal
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Enhanced File Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-slate-600/30 shadow-lg"
          >
            <div className="flex items-center gap-6">
              <motion.div
                className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold truncate text-slate-900 dark:text-slate-100 mb-2">
                  {fileName ?? "Unknown file"}
                </p>
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {status ?? "Preparing scan..."}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 100 }}
            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-white/30 dark:border-slate-600/30 shadow-lg space-y-8"
          >
            {/* Current Stage Display */}
            <div className="flex flex-col items-center gap-6">
              <motion.div
                animate={{
                  rotate: currentStage.stage === 'complete' ? 0 : 360,
                  scale: currentStage.stage === 'complete' ? [1, 1.2, 1] : 1
                }}
                transition={{
                  rotate: {
                    duration: currentStage.stage === 'complete' ? 0 : 3,
                    repeat: currentStage.stage === 'complete' ? 0 : Infinity,
                    ease: "linear"
                  },
                  scale: {
                    duration: 0.6,
                    repeat: currentStage.stage === 'complete' ? 2 : 0
                  }
                }}
                className={`p-6 rounded-2xl shadow-xl ${
                  currentStage.stage === 'complete'
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                    : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                }`}
              >
                <currentStage.icon className={`w-8 h-8 ${
                  currentStage.stage === 'complete'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
              </motion.div>
              <div className="text-center">
                <motion.p
                  className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2"
                  key={currentStage.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {currentStage.text}
                </motion.p>
                <motion.p
                  className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
                  key={progress}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {Math.round(progress)}% complete
                </motion.p>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="space-y-6">
              <div className="relative">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 h-full bg-gradient-to-r from-white/30 to-transparent rounded-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>

              {/* Enhanced Stage Indicators */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: Upload, label: 'Upload', threshold: 0 },
                  { icon: Search, label: 'Analyze', threshold: 30 },
                  { icon: Zap, label: 'Process', threshold: 60 },
                  { icon: CheckCircle2, label: 'Complete', threshold: 90 }
                ].map((stage, index) => (
                  <motion.div
                    key={stage.label}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-500 ${
                      progress >= stage.threshold
                        ? stage.threshold >= 90
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      animate={progress >= stage.threshold ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <stage.icon className="w-5 h-5" />
                    </motion.div>
                    <span className="text-xs font-medium">{stage.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Enhanced Security Info */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 100 }}
            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-slate-600/30 shadow-lg"
          >
            <div className="flex flex-wrap items-center justify-center gap-6">
              <motion.div
                className="flex items-center gap-3 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-700 dark:text-blue-300">VirusTotal API</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-3 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-purple-700 dark:text-purple-300">70+ Engines</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600 px-4 py-2 text-sm font-medium">
                  <Shield className="w-4 h-4 mr-2" />
                  Secure Scanning
                </Badge>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
