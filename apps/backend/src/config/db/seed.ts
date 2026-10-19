import { db } from "@config/db";
import type { Role } from "@config/db/generated/enums";

const users: { name: string; email: string; password: string; role: Role }[] = [
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

for (const { password, ...user } of users) {
  const password_hash = await Bun.password.hash(password);
  await db.user.upsert({
    where: { email: user.email },
    update: { password_hash, role: user.role, isActive: true },
    create: { ...user, password_hash },
  });
  console.log(`seeded ${user.role}: ${user.email}`);
}

await db.$disconnect();
