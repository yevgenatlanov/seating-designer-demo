"use client"

import type React from "react"

import type { Stage } from "@/lib/types"

interface StageComponentProps {
  stage: Stage
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
}

export function StageComponent({ stage, isSelected, onMouseDown }: StageComponentProps) {
  return (
    <div
      className={`absolute cursor-move select-none ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      style={{
        left: stage.x,
        top: stage.y,
        width: stage.width,
        height: stage.height,
      }}
      onMouseDown={onMouseDown}
    >
      <div className="w-full h-full bg-blue-200 border-2 border-blue-400 rounded-lg shadow-lg flex items-center justify-center">
        <span className="text-blue-800 font-semibold">STAGE</span>
      </div>
    </div>
  )
}
