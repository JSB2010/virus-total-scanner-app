"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Clock,
  Search,
  Filter,
  Calendar,
  Trash2,
  Eye
} from "lucide-react"

interface ScanHistoryListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewScan: (scan: any) => void
}

export function ScanHistoryListDialog({ open, onOpenChange, onViewScan }: ScanHistoryListDialogProps) {
  const [scanHistory, setScanHistory] = useState<any[]>([])
  const [filteredHistory, setFilteredHistory] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "clean" | "threat">("all")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadScanHistory()
    }
  }, [open])

  useEffect(() => {
    filterScans()
  }, [scanHistory, searchTerm, filterStatus])

  const loadScanHistory = async () => {
    setIsLoading(true)
    try {
      const history = await window.electronAPI.getRecentScans()
      setScanHistory(history || [])
    } catch (error) {
      console.error("Failed to load scan history:", error)
      setScanHistory([])
    }
    setIsLoading(false)
  }

  const filterScans = () => {
    let filtered = scanHistory

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(scan =>
        scan.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(scan => {
        if (filterStatus === "threat") return scan.threats > 0
        if (filterStatus === "clean") return scan.threats === 0
        return true
      })
    }

    setFilteredHistory(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusIcon = (threats: number) => {
    if (threats > 0) return <XCircle className="w-5 h-5 text-red-600" />
    return <CheckCircle2 className="w-5 h-5 text-green-600" />
  }

  const getStatusBadge = (threats: number) => {
    if (threats > 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          {threats} Threat{threats > 1 ? "s" : ""}
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
        Clean
      </Badge>
    )
  }

  const clearHistory = async () => {
    if (confirm("Are you sure you want to clear all scan history? This action cannot be undone.")) {
      try {
        // For now, just clear the local state - we'll implement proper clearing later
        setScanHistory([])
        // TODO: Implement proper scan history clearing in electron API
      } catch (error) {
        console.error("Failed to clear scan history:", error)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-[90vw] max-h-[85vh] m-4 border-0 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-2xl rounded-2xl overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Scan History
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base">
                View and manage all your security scan results
              </DialogDescription>
            </div>
          </motion.div>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Search and Filter Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-300/50"
              />
            </div>
            <div className="flex gap-2">
              {["all", "clean", "threat"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status as any)}
                  className={`capitalize ${
                    filterStatus === status
                      ? "bg-blue-600 text-white"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  {status}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Scan History List */}
          <div className="space-y-3">
            <AnimatePresence>
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-400">Loading scan history...</p>
                </motion.div>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((scan, index) => (
                  <motion.div
                    key={scan.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                          onClick={() => onViewScan(scan)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                              {getStatusIcon(scan.threats)}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100">
                                {scan.fileName}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {formatDate(scan.scanDate)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(scan.threats)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewScan(scan)
                              }}
                              className="bg-white/50 hover:bg-white/70"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {searchTerm || filterStatus !== "all" ? "No matching scans found" : "No scan history"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Scan results will appear here after you scan files"
                    }
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {filteredHistory.length} of {scanHistory.length} scans
            </div>
            <div className="flex gap-2">
              {scanHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear History
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-white hover:bg-slate-50 border-slate-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
