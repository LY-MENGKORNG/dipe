import { defineConfig } from "prisma/config";
import { env } from "@repo/env";

export default defineConfig({
  schema: "src/config/db/models/",
  migrations: {
    path: "src/config/db/migrations",
  },
  datasource: {
    url: env.DATABASE_URL,
  },
});
