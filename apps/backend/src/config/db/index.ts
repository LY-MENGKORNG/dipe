import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@repo/env";
import { PrismaClient } from "./generated/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const db = new PrismaClient({ adapter });
export type PrismaDB = typeof db;
