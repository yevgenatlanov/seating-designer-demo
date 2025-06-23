import { faker } from "@faker-js/faker";
import type { Person, Table, SeatAssignment } from "./types";

// Set a consistent seed for reproducible results
faker.seed(12345);

export function generateMockPeople(count: number): Person[] {
  // Reset seed before generating to ensure consistency
  faker.seed(12345);

  return Array.from({ length: count }, (_, index) => ({
    id: `person-${index + 1}`, // Use deterministic IDs instead of random UUIDs
    name: faker.person.fullName(),
    avatar: faker.image.avatar(),
    company: faker.company.name(),
    title: faker.person.jobTitle(),
    role: faker.helpers.arrayElement(["VIP", "Speaker", "Sponsor", "Guest"]),
  }));
}

export function generateDemoTables(): Table[] {
  return [
    // Head Table (rectangular, 8 seats) - positioned prominently near stage
    {
      id: "demo-table-1",
      x: 650,
      y: 180,
      shape: "round",
      seatCount: 8,
      width: 140,
      height: 140,
      name: "Head Table",
    },
    // VIP Round Table (6 seats) - close to stage
    {
      id: "demo-table-2",
      x: 240,
      y: 180,
      shape: "round",
      seatCount: 6,
      width: 140,
      height: 140,
      name: "VIP Table",
    },

    {
      id: "demo-table-7",
      x: 450,
      y: 180,
      shape: "round",
      seatCount: 4,
      width: 120,
      height: 120,
      name: "Networking",
    },
    // Sponsors Table (rectangular, 10 seats)
    {
      id: "demo-table-3",
      x: 400,
      y: 380,
      shape: "rectangular",
      seatCount: 16,
      width: 220,
      height: 100,
      name: "Sponsors Table",
    },
    // General Seating - Round Table 1
    {
      id: "demo-table-4",
      x: 200,
      y: 420,
      shape: "round",
      seatCount: 8,
      width: 160,
      height: 160,
      name: "Table 4",
    },
    // General Seating - Round Table 2
    {
      id: "demo-table-5",
      x: 680,
      y: 420,
      shape: "round",
      seatCount: 8,
      width: 160,
      height: 160,
      name: "Table 5",
    },
    // General Seating - Rectangular Table
  ];
}

export function generateDemoAssignments(
  tables: Table[],
  people: Person[]
): SeatAssignment[] {
  const assignments: SeatAssignment[] = [];
  let personIndex = 0;

  tables.forEach((table) => {
    const seatsToFill = Math.floor(
      table.seatCount * (0.6 + Math.random() * 0.2)
    );

    for (
      let seatIndex = 0;
      seatIndex < seatsToFill && personIndex < people.length;
      seatIndex++
    ) {
      assignments.push({
        tableId: table.id,
        seatIndex,
        personId: people[personIndex].id,
      });
      personIndex++;
    }
  });

  return assignments;
}
