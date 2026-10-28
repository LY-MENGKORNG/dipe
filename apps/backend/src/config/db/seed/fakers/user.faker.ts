import { User } from "@config/db/generated/client"

export type FakeUser = Omit<
  User,
  "isActive" | "createdAt" | "updatedAt" | "provider"
>

const defaultSeedPassword = "user@12345"
const passwordHash = await Bun.password.hash(defaultSeedPassword)

export const fakeUsers = [
  {
    id: 1,
    name: "Admin",
    email: "admin@dipe.dev",
    passwordHash,
    role: "ADMIN",
    language: "KM",
  },
  {
    id: 2,
    name: "Employee",
    email: "employee@dipe.dev",
    passwordHash,
    role: "EMPLOYEE",
    language: "EN",
  },
  {
    id: 3,
    name: "Staff",
    email: "staff@dipe.dev",
    passwordHash,
    role: "STAFF",
    language: "EN",
  },
] as const satisfies FakeUser[]
