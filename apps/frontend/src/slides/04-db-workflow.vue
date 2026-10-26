<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "PostgreSQL + Prisma: the workflow",
  section: "Database & ORM",
  notes: [
    "PostgreSQL is the database: tables, constraints, transactions, indexes. Prisma is the ORM: it lets us describe tables as models and gives us a typed client.",
    "Loop: 1) edit .prisma models, 2) `prisma migrate dev` diffs models vs DB and writes a SQL migration, 3) `prisma generate` emits the typed client, 4) query it from a repository.",
    'Prisma 7 in this repo: the generator is "prisma-client" (code is generated into src/config/db/generated, not node_modules), and a driver adapter (@prisma/adapter-pg) is required.',
    'prisma.config.ts replaces the old package.json "prisma" key: schema folder, migrations folder, datasource URL.',
    "Always read the generated SQL before committing it. Migrations are the contract with production data.",
  ],
  ask: "Why do we commit migration SQL instead of just running `prisma db push` everywhere?",
}
</script>

<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CodeSnippet from "@/components/deck/CodeSnippet.vue"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const steps = [
  {
    n: 1,
    title: "Model",
    cmd: "db/models/*.prisma",
    desc: "Describe tables as models",
  },
  {
    n: 2,
    title: "Migrate",
    cmd: "bun run db:migration:apply",
    desc: "Diff → SQL file → apply",
  },
  {
    n: 3,
    title: "Generate",
    cmd: "bun run db:generate",
    desc: "Typed client in generated/",
  },
  {
    n: 4,
    title: "Query",
    cmd: "db.user.findMany()",
    desc: "Autocomplete + type safety",
  },
]

const schema = `
  generator client {
    provider = "prisma-client"   // Prisma 7 generator
    output   = "../generated"    // client lives in our src/
    runtime  = "bun"
  }

  datasource db {
    provider = "postgresql"      // URL comes from prisma.config.ts
  }
`

const config = `
  import { defineConfig } from "prisma/config";
  import { env } from "@repo/env";

  export default defineConfig({
    schema: "db/models/",                 // one file per model
    migrations: { path: "db/migrations" },
    datasource: { url: env.DATABASE_URL },
  });
`

const migration = `
  -- 20261025123400/migration.sql (generated)
  CREATE TYPE "WorkspaceVisibility" AS ENUM ('PRIVATE', 'PUBLIC');
  CREATE TABLE "workspace" (
      "id" SERIAL NOT NULL,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "visibility" "WorkspaceVisibility" NOT NULL DEFAULT 'PRIVATE',
      "owner_id" INTEGER NOT NULL,
      CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
  );
  CREATE INDEX "workspace_owner_id_idx" ON "workspace"("owner_id");
  ALTER TABLE "workspace" ADD CONSTRAINT "workspace_owner_id_fkey"
    FOREIGN KEY ("owner_id") REFERENCES "user"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
`
</script>

<template>
  <SlideLayout
    section="Database & ORM"
    title="PostgreSQL + Prisma: the workflow"
    subtitle="Models are the source of truth. Migrations move the database. The generated client moves your code."
  >
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="step in steps" :key="step.n" size="sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Badge>{{ step.n }}</Badge
            >{{ step.title }}
          </CardTitle>
          <CardDescription>{{ step.desc }}</CardDescription>
          <code class="truncate font-mono text-xs">{{ step.cmd }}</code>
        </CardHeader>
      </Card>
    </div>

    <Tabs default-value="schema">
      <TabsList>
        <TabsTrigger value="schema"> schema.prisma </TabsTrigger>
        <TabsTrigger value="config"> prisma.config.ts </TabsTrigger>
        <TabsTrigger value="migration"> migration.sql </TabsTrigger>
      </TabsList>
      <TabsContent value="schema">
        <CodeSnippet
          :code="schema"
          lang="prisma"
          title="src/config/db/models/schema.prisma"
          :highlight="[2, 3]"
        />
      </TabsContent>
      <TabsContent value="config">
        <CodeSnippet
          :code="config"
          title="src/config/prisma.config.ts"
          :highlight="[5, 6, 7]"
        />
      </TabsContent>
      <TabsContent value="migration">
        <CodeSnippet
          :code="migration"
          lang="sql"
          title="db/migrations/20261025123400/migration.sql"
          :highlight="[11, 12, 13, 14]"
        />
      </TabsContent>
    </Tabs>
  </SlideLayout>
</template>
