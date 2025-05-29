"use client"

import { ScanResultDialog } from "./ScanResultDialog"

interface ScanHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scanData: any
}

export function ScanHistoryDialog({ open, onOpenChange, scanData }: ScanHistoryDialogProps) {
  if (!scanData) return null

  // Transform scanData to match ScanResultDialog format
  const transformedResult = {
    fileName: scanData.fileName,
    status: (scanData.threats > 0 ? 'threat' : 'clean') as 'threat' | 'clean' | 'error',
    positives: scanData.threats || 0,
    total: scanData.stats?.total || 70, // Default fallback
    scanId: scanData.scanId,
    permalink: scanData.permalink,
    scanDate: scanData.scanDate,
    filePath: scanData.filePath,
    fileSize: scanData.fileSize || 'Unknown',
    scanDuration: 'Historical scan',
    detections: scanData.detections || [],
    engineStats: {
      clean: (scanData.stats?.total || 70) - (scanData.threats || 0),
      threats: scanData.threats || 0,
      total: scanData.stats?.total || 70
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleQuarantine = async () => {
    // Handle quarantine for historical scans
    if (scanData.filePath) {
      try {
        await window.electronAPI.deleteFile(scanData.filePath)
        onOpenChange(false)
      } catch (error) {
        console.error("Failed to quarantine file:", error)
      }
    }
  }

  // Use the enhanced ScanResultDialog component
  return (
    <ScanResultDialog
      open={open}
      onClose={handleClose}
      result={transformedResult}
      onQuarantine={transformedResult.status === 'threat' ? handleQuarantine : undefined}
    />
  )
}
