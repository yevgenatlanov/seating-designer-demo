"use client";

import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Download,
  Users,
  MapPin,
  Trash2,
  Settings,
  Save,
  X,
} from "lucide-react";
import type { Person, Table, SeatAssignment } from "@/lib/types";

interface ToolsSidebarProps {
  people: Person[];
  unassignedPeople: Person[];
  tables: Table[];
  seatAssignments: SeatAssignment[];
  selectedItem: string | null;
  onAddTable: (shape: "round" | "rectangular", seatCount: number) => void;
  onDeleteTable: (id: string) => void;
  onUpdateTable: (id: string, updates: Partial<Table>) => void;
  onSelectItem: (id: string | null) => void;
  onExport: () => void;
}

export function ToolsSidebar({
  people,
  unassignedPeople,
  tables,
  seatAssignments,
  selectedItem,
  onAddTable,
  onDeleteTable,
  onUpdateTable,
  onSelectItem,
  onExport,
}: ToolsSidebarProps) {
  const totalSeats = tables.reduce((sum, table) => sum + table.seatCount, 0);
  const occupiedSeats = seatAssignments.length;

  // Find selected table
  const selectedTable = selectedItem
    ? tables.find((t) => t.id === selectedItem)
    : null;

  // Local state for editing
  const [editName, setEditName] = useState("");
  const [editSeatCount, setEditSeatCount] = useState(4);
  const [editShape, setEditShape] = useState<"round" | "rectangular">("round");

  // Update local state when selection changes
  React.useEffect(() => {
    if (selectedTable) {
      setEditName(
        selectedTable.name || `Table ${selectedTable.id.split("-")[1]}`
      );
      setEditSeatCount(selectedTable.seatCount);
      setEditShape(selectedTable.shape);
    }
  }, [selectedTable]);

  const handleSaveTable = () => {
    if (!selectedTable) return;

    onUpdateTable(selectedTable.id, {
      name: editName,
      seatCount: editSeatCount,
      shape: editShape,
      width:
        editShape === "round"
          ? Math.max(120, editSeatCount * 15)
          : Math.max(160, editSeatCount * 12),
      height:
        editShape === "round"
          ? Math.max(120, editSeatCount * 15)
          : Math.max(100, Math.min(editSeatCount * 8, 120)),
    });

    // Close the edit panel after saving
    onSelectItem(null);
  };

  const handleCloseEdit = () => {
    // Reset form to original values
    if (selectedTable) {
      setEditName(
        selectedTable.name || `Table ${selectedTable.id.split("-")[1]}`
      );
      setEditSeatCount(selectedTable.seatCount);
      setEditShape(selectedTable.shape);
    }
    // Close the edit panel
    onSelectItem(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-4">Seating Map Designer</h2>

        {/* Condensed Statistics */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-lg font-bold">{tables.length}</div>
            <div className="text-xs text-muted-foreground">Tables</div>
          </div>
          <div>
            <div className="text-lg font-bold">{totalSeats}</div>
            <div className="text-xs text-muted-foreground">Seats</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {occupiedSeats}
            </div>
            <div className="text-xs text-muted-foreground">Occupied</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">
              {totalSeats - occupiedSeats}
            </div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Table Editor - Show when table is selected */}
      {selectedTable && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Edit Table
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseEdit}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="table-name" className="text-sm">
                Table Name
              </Label>
              <Input
                id="table-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter table name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="table-shape" className="text-sm">
                Shape
              </Label>
              <Select
                value={editShape}
                onValueChange={(value: "round" | "rectangular") =>
                  setEditShape(value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round">● Round</SelectItem>
                  <SelectItem value="rectangular">■ Rectangular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="seat-count" className="text-sm">
                Number of Seats
              </Label>
              <Select
                value={editSeatCount.toString()}
                onValueChange={(value) => setEditSeatCount(Number(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} seats
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveTable} size="sm" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteTable(selectedTable.id)}
                className="px-3"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tables - Show when no table is selected */}
      {/* Add Tables - Show when no table is selected */}
      {!selectedTable && (
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Tables
          </h3>

          {/* Quick Add Presets */}
          <div className="space-y-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => onAddTable("round", 8)}
            >
              <div className="w-4 h-4 rounded-full bg-blue-200 border border-blue-400 mr-2" />
              Standard Round (8 seats)
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => onAddTable("rectangular", 6)}
            >
              <div className="w-4 h-3 bg-green-200 border border-green-400 mr-2" />
              Standard Rectangular (6 seats)
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => onAddTable("round", 6)}
            >
              <div className="w-3 h-3 rounded-full bg-purple-200 border border-purple-400 mr-2" />
              VIP Round (6 seats)
            </Button>
          </div>

          {/* Custom Configuration */}
          <div className="border-t pt-3">
            <div className="text-xs text-muted-foreground mb-2">
              Custom Table
            </div>
            <div className="space-y-2">
              <div className="flex gap-1">
                <Select
                  defaultValue="round"
                  onValueChange={(shape: "round" | "rectangular") => {
                    const seatCount = 6;
                    onAddTable(shape, seatCount);
                  }}
                >
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round">● Round</SelectItem>
                    <SelectItem value="rectangular">■ Rectangular</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  defaultValue="6"
                  onValueChange={(seats) => {
                    const seatCount = Number(seats);
                    onAddTable("round", seatCount);
                  }}
                >
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[4, 5, 6, 7, 8, 10, 12, 14, 16].map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} seats
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Tables List */}
      <div>
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Tables ({tables.length})
        </h3>
        <ScrollArea className="h-32">
          <div className="space-y-1">
            {tables.map((table) => {
              const assignedSeats = seatAssignments.filter(
                (a) => a.tableId === table.id
              ).length;
              return (
                <div
                  key={table.id}
                  className={`flex items-center justify-between p-2 rounded text-sm cursor-pointer ${
                    selectedItem === table.id
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => onSelectItem(table.id)}
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {table.shape === "round" ? "●" : "■"}{" "}
                      {table.name || `Table ${table.id.split("-")[1]}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {assignedSeats}/{table.seatCount} occupied
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Unassigned People */}
      <div>
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Unassigned ({unassignedPeople.length})
        </h3>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {unassignedPeople.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-muted"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={person.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {person.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {person.title} at {person.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Export */}
      <Button onClick={onExport} className="w-full" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );
}
