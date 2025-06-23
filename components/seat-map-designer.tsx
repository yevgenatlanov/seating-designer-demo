"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ToolsSidebar } from "./tools-sidebar";
import { Canvas } from "./canvas";
import { ExportDialog } from "./export-dialog";
import { PersonAssignDialog } from "./person-assign-dialog";
import {
  generateMockPeople,
  generateDemoTables,
  generateDemoAssignments,
} from "@/lib/mock-data";
import type { Person, Table, Stage, SeatAssignment } from "@/lib/types";

export function SeatMapDesigner() {
  const [people, setPeople] = useState<Person[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [stage, setStage] = useState<Stage>({
    id: "stage",
    x: 400,
    y: 20,
    width: 250,
    height: 100,
  });
  const [seatAssignments, setSeatAssignments] = useState<SeatAssignment[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPersonDialog, setShowPersonDialog] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<{
    tableId: string;
    seatIndex: number;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Generate demo data only on client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const mockPeople = generateMockPeople(50);
    const demoTables = generateDemoTables();
    const demoAssignments = generateDemoAssignments(demoTables, mockPeople);

    setPeople(mockPeople);
    setTables(demoTables);
    setSeatAssignments(demoAssignments);
  }, []);

  const addTable = useCallback(
    (shape: "round" | "rectangular", seatCount: number) => {
      const newTable: Table = {
        id: `table-${Date.now()}`,
        x: 200,
        y: 200,
        shape,
        seatCount,
        width:
          shape === "round"
            ? Math.max(120, seatCount * 15)
            : Math.max(160, seatCount * 12),
        height:
          shape === "round"
            ? Math.max(120, seatCount * 15)
            : Math.max(100, Math.min(seatCount * 8, 120)),
        name: `Table ${tables.length + 1}`,
      };
      setTables((prev) => [...prev, newTable]);
      setSelectedItem(newTable.id); // Auto-select the new table
    },
    [tables.length]
  );

  const updateTable = useCallback((id: string, updates: Partial<Table>) => {
    setTables((prev) =>
      prev.map((table) => (table.id === id ? { ...table, ...updates } : table))
    );
  }, []);

  const deleteTable = useCallback((id: string) => {
    setTables((prev) => prev.filter((table) => table.id !== id));
    setSeatAssignments((prev) =>
      prev.filter((assignment) => assignment.tableId !== id)
    );
    setSelectedItem(null); // Clear selection when deleting
  }, []);

  const updateStage = useCallback((updates: Partial<Stage>) => {
    setStage((prev) => ({ ...prev, ...updates }));
  }, []);

  const assignPersonToSeat = useCallback(
    (tableId: string, seatIndex: number, personId: string | null) => {
      setSeatAssignments((prev) => {
        const filtered = prev.filter(
          (a) => !(a.tableId === tableId && a.seatIndex === seatIndex)
        );
        if (personId) {
          // Remove person from any other seat first
          const withoutPerson = filtered.filter((a) => a.personId !== personId);
          return [...withoutPerson, { tableId, seatIndex, personId }];
        }
        return filtered;
      });
    },
    []
  );

  const handleSeatClick = useCallback((tableId: string, seatIndex: number) => {
    setSelectedSeat({ tableId, seatIndex });
    setShowPersonDialog(true);
  }, []);

  const getPersonForSeat = useCallback(
    (tableId: string, seatIndex: number): Person | null => {
      const assignment = seatAssignments.find(
        (a) => a.tableId === tableId && a.seatIndex === seatIndex
      );
      if (!assignment) return null;

      const person = people.find((p) => p.id === assignment.personId);
      return person || null; // Handle undefined case by returning null
    },
    [seatAssignments, people]
  );

  const getUnassignedPeople = useCallback(() => {
    const assignedPersonIds = new Set(seatAssignments.map((a) => a.personId));
    return people.filter((p) => !assignedPersonIds.has(p.id));
  }, [people, seatAssignments]);

  const exportData = useCallback(() => {
    return {
      tables,
      stage,
      people,
      seatAssignments,
      exportedAt: new Date().toISOString(),
    };
  }, [tables, stage, people, seatAssignments]);

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">
            Loading Seating Map Designer...
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Preparing your demo workspace
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="w-80">
          <SidebarContent>
            <ToolsSidebar
              people={people}
              unassignedPeople={getUnassignedPeople()}
              tables={tables}
              seatAssignments={seatAssignments}
              selectedItem={selectedItem}
              onAddTable={addTable}
              onDeleteTable={deleteTable}
              onUpdateTable={updateTable}
              onSelectItem={setSelectedItem}
              onExport={() => setShowExportDialog(true)}
            />
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <div ref={canvasRef} className="h-full w-full">
            <Canvas
              tables={tables}
              stage={stage}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
              onUpdateTable={updateTable}
              onUpdateStage={updateStage}
              onSeatClick={handleSeatClick}
              getPersonForSeat={getPersonForSeat}
            />
          </div>
        </SidebarInset>
      </div>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={exportData}
        canvasRef={canvasRef}
      />

      <PersonAssignDialog
        open={showPersonDialog}
        onOpenChange={setShowPersonDialog}
        people={people}
        tables={tables}
        seatAssignments={seatAssignments}
        selectedSeat={selectedSeat}
        currentPerson={
          selectedSeat
            ? getPersonForSeat(selectedSeat.tableId, selectedSeat.seatIndex)
            : null
        }
        onAssign={(personId) => {
          if (selectedSeat) {
            assignPersonToSeat(
              selectedSeat.tableId,
              selectedSeat.seatIndex,
              personId
            );
          }
        }}
      />
    </SidebarProvider>
  );
}
