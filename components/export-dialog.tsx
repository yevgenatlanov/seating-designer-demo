"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileJson, FileText } from "lucide-react"
import { generatePDF } from "@/lib/pdf-export"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: () => any
  canvasRef: React.RefObject<HTMLDivElement>
}

export function ExportDialog({ open, onOpenChange, onExport, canvasRef }: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleJSONExport = () => {
    const data = onExport()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `seating-map-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePDFExport = async () => {
    if (!canvasRef.current) return

    setIsExporting(true)
    try {
      const data = onExport()
      await generatePDF(canvasRef.current, data)
    } catch (error) {
      console.error("PDF export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Seating Map</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Button onClick={handleJSONExport} className="flex items-center gap-2 h-12" variant="outline">
              <FileJson className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Export as JSON</div>
                <div className="text-xs text-muted-foreground">Save all data for later import</div>
              </div>
            </Button>

            <Button
              onClick={handlePDFExport}
              disabled={isExporting}
              className="flex items-center gap-2 h-12"
              variant="outline"
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">{isExporting ? "Generating PDF..." : "Export as PDF"}</div>
                <div className="text-xs text-muted-foreground">Visual seating chart with guest list</div>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
