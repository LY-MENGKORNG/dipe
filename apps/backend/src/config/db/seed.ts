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
  const passwordHash = await Bun.password.hash(password);
  await db.user.upsert({
    where: { email: user.email },
    update: { passwordHash, role: user.role, isActive: true },
    create: { ...user, passwordHash },
  });
  console.log(`seeded ${user.role}: ${user.email}`);
}

const tags = ["nestjs", "prisma", "postgres", "bun"];

for (const name of tags) {
  await db.tag.upsert({ where: { name }, update: {}, create: { name } });
}
console.log(`seeded tags: ${tags.join(", ")}`);

const posts = [
  { title: "Getting started with NestJS", tags: ["nestjs", "bun"] },
  { title: "Many-to-many with Prisma", tags: ["prisma", "postgres"] },
  { title: "Transactions in a repository", tags: ["nestjs", "prisma"] },
];

const poster = await db.user.findUniqueOrThrow({ where: { email: users[0]!.email } });

for (const post of posts) {
  if (await db.post.findFirst({ where: { title: post.title } })) continue;

  await db.post.create({
    data: {
      title: post.title,
      poster: { connect: { id: poster.id } },
      tags: { create: post.tags.map((name) => ({ tag: { connect: { name } } })) },
    },
  });
  console.log(`seeded post: ${post.title}`);
}

await db.$disconnect();
