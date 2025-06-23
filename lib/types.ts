export interface Person {
  id: string
  name: string
  avatar: string
  company: string
  title: string
  role: string
}

export interface Table {
  id: string
  x: number
  y: number
  shape: "round" | "rectangular"
  seatCount: number
  width: number
  height: number
  name?: string
}

export interface Stage {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface SeatAssignment {
  tableId: string
  seatIndex: number
  personId: string
}
