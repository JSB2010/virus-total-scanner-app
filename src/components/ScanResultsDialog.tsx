"use client"

import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Trash2,
  FolderOpen,
  Shield,
  FileText,
  Calendar,
  Hash,
  BarChart3,
  Globe,
  Eye,
  Download,
  XCircle
} from "lucide-react"

interface ScanResultsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  results: any
  onDelete: () => void
  onShowInFolder: () => void
}

export function ScanResultsDialog({ open, onOpenChange, results, onDelete, onShowInFolder }: ScanResultsDialogProps) {
  if (!results) return null

  const isThreat = results.positives > 0
  const threatLevel =
    results.positives === 0 ? "clean" : results.positives <= 2 ? "low" : results.positives <= 5 ? "medium" : "high"

  const getThreatColor = () => {
    switch (threatLevel) {
      case "clean":
        return "text-green-600"
      case "low":
        return "text-yellow-600"
      case "medium":
        return "text-orange-600"
      case "high":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getThreatBadge = () => {
    if (threatLevel === "clean") {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Clean
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          {results.positives}/{results.total} Detections
        </Badge>
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-2xl">
        <DialogHeader className="pb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              isThreat
                ? 'bg-gradient-to-br from-red-500 to-pink-600'
                : 'bg-gradient-to-br from-green-500 to-emerald-600'
            }`}>
              {isThreat ? (
                <AlertTriangle className="w-6 h-6 text-white" />
              ) : (
                <CheckCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Scan Results
              </DialogTitle>
              <DialogDescription className="text-base text-slate-600 dark:text-slate-400">
                VirusTotal analysis for {results.fileName}
              </DialogDescription>
            </div>
          </motion.div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {/* Enhanced Threat Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className={`glass border-0 shadow-lg ${
              isThreat
                ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
                : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      isThreat
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      <Shield className={`w-6 h-6 ${
                        isThreat
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-semibold ${
                        isThreat
                          ? 'text-red-900 dark:text-red-100'
                          : 'text-green-900 dark:text-green-100'
                      }`}>
                        {isThreat ? "Threats Detected" : "File is Clean"}
                      </h3>
                      <p className={`text-sm ${
                        isThreat
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-green-700 dark:text-green-300'
                      }`}>
                        {isThreat
                          ? `${results.positives} out of ${results.total} engines flagged this file`
                          : `No threats detected by ${results.total} antivirus engines`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getThreatBadge()}
                    <div className="mt-2">
                      <div className={`text-3xl font-bold ${
                        isThreat
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {Math.round(((results.total - results.positives) / results.total) * 100)}%
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Clean Rate</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Security Assessment</span>
                    <span>{results.total - results.positives}/{results.total} Clean</span>
                  </div>
                  <Progress
                    value={((results.total - results.positives) / results.total) * 100}
                    className={`h-3 ${
                      isThreat
                        ? 'bg-red-200 dark:bg-red-900'
                        : 'bg-green-200 dark:bg-green-900'
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* File Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              File Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">File Name:</span>
                <div className="font-medium">{results.fileName}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Scan Date:</span>
                <div className="font-medium">{new Date(results.scanDate).toLocaleString()}</div>
              </div>
              {results.sha256 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">SHA256:</span>
                  <div className="font-mono text-xs break-all">{results.sha256}</div>
                </div>
              )}
              {results.md5 && (
                <div>
                  <span className="text-muted-foreground">MD5:</span>
                  <div className="font-mono text-xs">{results.md5}</div>
                </div>
              )}
              {results.sha1 && (
                <div>
                  <span className="text-muted-foreground">SHA1:</span>
                  <div className="font-mono text-xs">{results.sha1}</div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Detection Details */}
          {isThreat && results.detections && results.detections.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-red-600">Threat Details</h3>
              <div className="space-y-2">
                {results.detections.map((detection: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{detection.engine}</div>
                      <div className="text-sm text-red-600">{detection.result}</div>
                      {detection.category && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Category: {detection.category}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="destructive" className="text-xs">
                        {detection.category || 'Threat'}
                      </Badge>
                      {detection.method && (
                        <span className="text-xs text-muted-foreground">{detection.method}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scan Statistics */}
          <div className="space-y-3">
            <h3 className="font-semibold">Scan Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{results.total}</div>
                <div className="text-xs text-muted-foreground">Total Engines</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{results.positives}</div>
                <div className="text-xs text-muted-foreground">Malicious</div>
              </div>
              {results.stats && (
                <>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{results.stats.suspicious || 0}</div>
                    <div className="text-xs text-muted-foreground">Suspicious</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{results.stats.harmless || 0}</div>
                    <div className="text-xs text-muted-foreground">Harmless</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/20"
        >
          <div className="flex gap-3 flex-1">
            <Button
              variant="outline"
              onClick={onShowInFolder}
              className="flex-1 bg-white/50 hover:bg-white/70 border-white/20"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Show in Folder
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(results.permalink, "_blank")}
              className="flex-1 bg-white/50 hover:bg-white/70 border-white/20"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Report
            </Button>
          </div>

          <div className="flex gap-3">
            {isThreat && (
              <Button
                variant="destructive"
                onClick={onDelete}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 shadow-lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete File
              </Button>
            )}
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white border-0 shadow-lg"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
