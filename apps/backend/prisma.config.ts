import { defineConfig } from "prisma/config";
import { env } from "@repo/env";

export default defineConfig({
  schema: "src/config/db/models/",
  migrations: {
    path: "src/config/db/migrations",
    seed: "bun ./src/config/db/seed/index.ts"
  },
  datasource: {
    url: env.DATABASE_URL,
  },
});
