"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Table, Person } from "@/lib/types"
import { UserCheck } from "lucide-react"

interface TableComponentProps {
  table: Table
  tableNumber: number
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onSeatClick: (tableId: string, seatIndex: number) => void
  getPersonForSeat: (tableId: string, seatIndex: number) => Person | null
}

export function TableComponent({
  table,
  tableNumber,
  isSelected,
  onMouseDown,
  onSeatClick,
  getPersonForSeat,
}: TableComponentProps) {
  const getSeatPosition = (index: number, total: number, width: number, height: number, shape: string) => {
    if (shape === "round") {
      const radius = Math.min(width, height) / 2 - 20
      const angle = (index * 2 * Math.PI) / total - Math.PI / 2
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      }
    } else {
      // Rectangular table seating arrangement
      const perimeter = 2 * (width + height) - 160 // Account for corners

      // Top side
      const topSeats = Math.ceil((total * (width - 40)) / perimeter)
      if (index < topSeats) {
        const spacing = (width - 80) / (topSeats - 1 || 1)
        return {
          x: -width / 2 + 40 + index * spacing,
          y: -height / 2 - 20,
        }
      }

      // Right side
      const rightSeats = Math.ceil((total * (height - 40)) / perimeter)
      if (index < topSeats + rightSeats) {
        const rightIndex = index - topSeats
        const spacing = (height - 80) / (rightSeats - 1 || 1)
        return {
          x: width / 2 + 20,
          y: -height / 2 + 40 + rightIndex * spacing,
        }
      }

      // Bottom side
      const bottomSeats = Math.ceil((total * (width - 40)) / perimeter)
      if (index < topSeats + rightSeats + bottomSeats) {
        const bottomIndex = index - topSeats - rightSeats
        const spacing = (width - 80) / (bottomSeats - 1 || 1)
        return {
          x: width / 2 - 40 - bottomIndex * spacing,
          y: height / 2 + 20,
        }
      }

      // Left side
      const leftIndex = index - topSeats - rightSeats - bottomSeats
      const leftSeats = total - topSeats - rightSeats - bottomSeats
      const spacing = (height - 80) / (leftSeats - 1 || 1)
      return {
        x: -width / 2 - 20,
        y: height / 2 - 40 - leftIndex * spacing,
      }
    }
  }

  const renderSeats = () => {
    const seats = []

    for (let i = 0; i < table.seatCount; i++) {
      const position = getSeatPosition(i, table.seatCount, table.width, table.height, table.shape)
      const person = getPersonForSeat(table.id, i)
      const seatNumber = `t${tableNumber}-s${i + 1}`

      // Create detailed tooltip text - using line breaks that work in title attribute
      const tooltipText = person
        ? `${seatNumber}
${person.name} - ${person.role}
${person.title}
${person.company}

Click to reassign`
        : `${seatNumber} - Empty
Click to assign person`

      seats.push(
        <div
          key={i}
          className={`absolute w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:scale-110 hover:z-10 ${
            person
              ? "bg-green-100 border-green-500 hover:bg-green-200"
              : "bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}
          style={{
            left: `calc(50% + ${position.x}px - 16px)`,
            top: `calc(50% + ${position.y}px - 16px)`,
          }}
          onClick={(e) => {
            e.stopPropagation()
            onSeatClick(table.id, i)
          }}
          title={tooltipText}
        >
          {person ? (
            <div className="relative w-full h-full">
              <Avatar className="w-full h-full">
                <AvatarImage src={person.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {person.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <UserCheck className="absolute -top-1 -right-1 w-3 h-3 text-green-600 bg-white rounded-full" />
              {/* No seat number badge for occupied seats - clean avatar display */}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-600">
              <div className="text-[10px] font-medium leading-tight">{`t${tableNumber}`}</div>
              <div className="text-[10px] leading-tight">{`s${i + 1}`}</div>
            </div>
          )}
        </div>,
      )
    }
    return seats
  }

  return (
    <div
      className={`absolute cursor-move select-none ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      style={{
        left: table.x,
        top: table.y,
        width: table.width,
        height: table.height,
      }}
      onMouseDown={onMouseDown}
    >
      {/* Table Name - Positioned above the table */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 -translate-y-8 bg-white px-2 py-1 rounded shadow-sm border text-sm font-medium text-gray-700 whitespace-nowrap pointer-events-none"
        style={{ top: 0 }}
      >
        {table.name || `Table ${tableNumber}`}
      </div>

      {/* Seat Count Badge - Positioned below the table */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 translate-y-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-600 whitespace-nowrap pointer-events-none"
        style={{ bottom: 0 }}
      >
        {table.seatCount} seats
      </div>

      {/* Table surface - Clean without text */}
      <div
        className={`w-full h-full border-2 border-gray-400 bg-white shadow-lg ${
          table.shape === "round" ? "rounded-full" : "rounded-lg"
        }`}
      >
        {/* Empty table surface for clean look */}
        <div className="w-full h-full" />
      </div>

      {/* Seats */}
      {renderSeats()}
    </div>
  )
}
