"use client";

import type React from "react";

import { useCallback, useState } from "react";
import { TableComponent } from "./table-component";
import { StageComponent } from "./stage-component";
import type { Table, Stage, Person } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface CanvasProps {
  tables: Table[];
  stage: Stage;
  selectedItem: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateTable: (id: string, updates: Partial<Table>) => void;
  onUpdateStage: (updates: Partial<Stage>) => void;
  onSeatClick: (tableId: string, seatIndex: number) => void;
  getPersonForSeat: (tableId: string, seatIndex: number) => Person | null;
}

export function Canvas({
  tables,
  stage,
  selectedItem,
  onSelectItem,
  onUpdateTable,
  onUpdateStage,
  onSeatClick,
  getPersonForSeat,
}: CanvasProps) {
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragId: string | null;
    offset: { x: number; y: number };
  }>({
    isDragging: false,
    dragId: null,
    offset: { x: 0, y: 0 },
  });

  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string, currentX: number, currentY: number) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      setDragState({
        isDragging: true,
        dragId: id,
        offset: { x: offsetX, y: offsetY },
      });
      onSelectItem(id);
    },
    [onSelectItem]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState.isDragging || !dragState.dragId) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - dragState.offset.x;
      const y = e.clientY - rect.top - dragState.offset.y;

      if (dragState.dragId === "stage") {
        onUpdateStage({ x, y });
      } else {
        onUpdateTable(dragState.dragId, { x, y });
      }
    },
    [dragState, onUpdateTable, onUpdateStage]
  );

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragId: null,
      offset: { x: 0, y: 0 },
    });
  }, []);

  return (
    <div className="relative w-full h-full bg-gray-50 overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button variant="outline" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleResetZoom}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="px-2 py-1 bg-white border rounded text-sm">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Canvas with zoom transform */}
      <div
        className="w-full h-full cursor-default"
        style={{
          transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: "center center",
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const isCanvasBackground =
            target === e.currentTarget ||
            target.classList.contains("canvas-background");

          if (isCanvasBackground) {
            onSelectItem(null);
          }
        }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20 canvas-background"
          style={{
            backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
            backgroundSize: "20px 20px",
            width: "200%",
            height: "200%",
            left: "-50%",
            top: "-50%",
            pointerEvents: "auto",
          }}
        />

        {/* Stage */}
        <StageComponent
          stage={stage}
          isSelected={selectedItem === "stage"}
          onMouseDown={(e) => handleMouseDown(e, "stage", stage.x, stage.y)}
        />

        {/* Tables */}
        {tables.map((table, index) => (
          <TableComponent
            key={table.id}
            table={table}
            tableNumber={index + 1}
            isSelected={selectedItem === table.id}
            onMouseDown={(e) => handleMouseDown(e, table.id, table.x, table.y)}
            onSeatClick={onSeatClick}
            getPersonForSeat={getPersonForSeat}
          />
        ))}

        {/* Instructions */}
        {tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400 pointer-events-auto canvas-background">
              <p className="text-lg font-medium">
                Welcome to Seating Map Designer
              </p>
              <p className="text-sm mt-2">
                Add tables from the sidebar to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
