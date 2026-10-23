import { type User } from "../generated/client";
import { type PrismaTx } from "@common/database";

type SeedUser = Omit<User, "id" | "passwordHash" | "isActive" | "createdAt" | "updatedAt"> & {
  password: string;
};

export const users: SeedUser[] = [
  {
    name: "Admin",
    email: Bun.env.SEED_ADMIN_EMAIL ?? "admin@dipe.dev",
    password: Bun.env.SEED_ADMIN_PASSWORD ?? "Admin@12345",
    role: "admin",
  },
  {
    name: "Employee",
    email: Bun.env.SEED_EMPLOYEE_EMAIL ?? "employee@dipe.dev",
    password: Bun.env.SEED_EMPLOYEE_PASSWORD ?? "Employee@12345",
    role: "employee",
  },
  {
    name: "Staff",
    email: Bun.env.SEED_STAFF_EMAIL ?? "staff@dipe.dev",
    password: Bun.env.SEED_STAFF_PASSWORD ?? "Staff@12345",
    role: "staff",
  },
];

export async function userSeed(tx: PrismaTx) {
  const seeded: User[] = [];

  for (const { password, ...user } of users) {
    const passwordHash = await Bun.password.hash(password);

    seeded.push(
      await tx.user.upsert({
        where: { email: user.email },
        update: { passwordHash, role: user.role, isActive: true },
        create: { ...user, passwordHash },
      }),
    );
    console.log(`seeded ${user.role}: ${user.email}`);
  }

  return seeded;
}
