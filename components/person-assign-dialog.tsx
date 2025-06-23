"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X, MapPin } from "lucide-react"
import type { Person, SeatAssignment, Table } from "@/lib/types"

interface PersonAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  people: Person[]
  tables: Table[]
  seatAssignments: SeatAssignment[]
  selectedSeat: { tableId: string; seatIndex: number } | null
  currentPerson: Person | null
  onAssign: (personId: string | null) => void
}

export function PersonAssignDialog({
  open,
  onOpenChange,
  people,
  tables,
  seatAssignments,
  selectedSeat,
  currentPerson,
  onAssign,
}: PersonAssignDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Get seat number for display
  const getSeatNumber = () => {
    if (!selectedSeat) return ""
    const tableIndex = tables.findIndex((t) => t.id === selectedSeat.tableId) + 1
    return `t${tableIndex}-s${selectedSeat.seatIndex + 1}`
  }

  // Get table name for display
  const getTableName = () => {
    if (!selectedSeat) return ""
    const table = tables.find((t) => t.id === selectedSeat.tableId)
    const tableIndex = tables.findIndex((t) => t.id === selectedSeat.tableId) + 1
    return table?.name || `Table ${tableIndex}`
  }

  // Get list of assigned person IDs (excluding current seat)
  const assignedPersonIds = new Set(
    seatAssignments
      .filter((assignment) => {
        // Exclude the current seat from the filter so we can reassign the same person
        if (selectedSeat) {
          return !(assignment.tableId === selectedSeat.tableId && assignment.seatIndex === selectedSeat.seatIndex)
        }
        return true
      })
      .map((assignment) => assignment.personId),
  )

  // Filter people to show only unassigned ones
  const availablePeople = people.filter((person) => !assignedPersonIds.has(person.id))

  // Apply search filter
  const filteredPeople = availablePeople.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAssign = (personId: string | null) => {
    onAssign(personId)
    onOpenChange(false)
    setSearchTerm("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Assign Person to {getSeatNumber()}
            <div className="text-sm font-normal text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {getTableName()} • {availablePeople.length} of {people.length} people available
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {currentPerson && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={currentPerson.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {currentPerson.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{currentPerson.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {currentPerson.title} at {currentPerson.company}
                    </div>
                    <div className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      Seated at {getSeatNumber()}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleAssign(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${availablePeople.length} available people...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-64">
            {filteredPeople.length > 0 ? (
              <div className="space-y-2">
                {filteredPeople.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleAssign(person.id)}
                  >
                    <Avatar>
                      <AvatarImage src={person.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {person.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{person.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {person.title} at {person.company}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                <div className="text-lg">🔍</div>
                <div className="text-sm mt-2">
                  {searchTerm ? "No people match your search" : "No available people to assign"}
                </div>
                {searchTerm && (
                  <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")} className="mt-2">
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>

          {currentPerson && (
            <Button variant="outline" className="w-full" onClick={() => handleAssign(null)}>
              Remove Person from Seat
            </Button>
          )}

          {availablePeople.length === 0 && !currentPerson && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">
                All people have been assigned to seats.
                <br />
                Remove someone from another seat to reassign them.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
