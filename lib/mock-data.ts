import { faker } from "@faker-js/faker";
import type { Person } from "./types";

faker.seed(12345);

export function generateMockPeople(count: number): Person[] {
  faker.seed(12345);

  return Array.from({ length: count }, (_, index) => ({
    id: `person-${index + 1}`,
    name: faker.person.fullName(),
    avatar: faker.image.avatar(),
    company: faker.company.name(),
    title: faker.person.jobTitle(),
    role: faker.helpers.arrayElement(["VIP", "Speaker", "Sponsor", "Guest"]),
  }));
}
