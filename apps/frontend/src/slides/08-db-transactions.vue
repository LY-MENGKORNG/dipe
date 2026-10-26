<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "Transactions",
  section: "Database & ORM",
  notes: [
    "A transaction = several writes that succeed together or fail together (Atomicity in ACID).",
    "Sequential form: pass an array of queries. Simple, but you cannot use the result of query 1 in query 2.",
    "Interactive form: a callback receives `tx`. Use `tx` — not `this.db` — for every query inside, or that query escapes the transaction.",
    "Throwing inside the callback rolls everything back. That is the whole API.",
    "Across repositories: each repository has its own this.db, so the plain tx parameter cannot reach them. TransactionHost.run() opens the transaction once; every repository called inside it uses the same tx automatically (AsyncLocalStorage). Nested run() calls join the outer transaction.",
    'Proof in the repo: the integration test "rolls back every repository write when the callback throws" (test/integration/transaction.host.int.spec.ts) creates a user through UserRepository, throws, and checks Postgres has no row.',
    "Keep it short: a transaction holds locks and a connection. Never call an external API or send an email inside one — that is what queues are for (next section).",
    "Show the migration warning from the repo: renaming `userId` → `user_id` on workspace_members (migration 20261025164624) was generated as DROP COLUMN + ADD COLUMN. In prod that is data loss — edit the SQL to `RENAME COLUMN` before applying.",
  ],
  ask: "What happens to the workspace row if adding the owner as a member fails?",
}
</script>

<script setup lang="ts">
import { ChevronsUpDown, TriangleAlert } from "@lucide/vue"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CodeSnippet from "@/components/deck/CodeSnippet.vue"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const sequential = `
  // Independent writes: all or nothing
  const [workspace, count] = await this.db.$transaction([
    this.db.workspace.create({ data: { name, slug, ownerId: userId } }),
    this.db.workspace.count({ where: { ownerId: userId } }),
  ]);
`

const interactive = `
  // Dependent writes: use the result of step 1 in step 2
  return this.db.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: { name, slug, ownerId: userId },
    });

    await tx.workspaceMember.create({
      data: { userId, workspaceId: workspace.id },
    });

    if (workspace.visibility === "PUBLIC") throw new Error("rollback!"); // undoes both

    return workspace;
  }, { timeout: 5_000 });
`

const acrossRepositories = `
  // users.service.ts — two repositories, one transaction
  constructor(
    private readonly transactions: TransactionHost,
    private readonly users: UserRepository,
    private readonly workspaces: WorkspaceRepository,
  ) {}

  createWithWorkspace(dto: CreateUserDto, passwordHash: string) {
    return this.transactions.run(async () => {
      const user = await this.users.create({ ...dto, passwordHash });  // this.db is tx
      await this.workspaces.create({ name: user.name, slug: slugify(user.name), ownerId: user.id }); // same tx
      return user;                                                       // commit
    });                                                                  // throw → rollback
  }
`

const migrationFix = `
  -- generated for userId → user_id ❌ drops every membership
  ALTER TABLE "workspace_members" DROP COLUMN "userId",
  DROP COLUMN "workspaceId",
  ADD COLUMN "user_id" INTEGER NOT NULL,
  ADD COLUMN "workspace_id" INTEGER NOT NULL;

  -- what we actually want ✅ (edit before applying)
  ALTER TABLE "workspace_members" RENAME COLUMN "userId" TO "user_id";
  ALTER TABLE "workspace_members" RENAME COLUMN "workspaceId" TO "workspace_id";
`
</script>

<template>
  <SlideLayout
    section="Database & ORM"
    title="Transactions"
    subtitle="Several writes that succeed together — or roll back together."
  >
    <Tabs default-value="interactive">
      <TabsList>
        <TabsTrigger value="sequential"> Sequential </TabsTrigger>
        <TabsTrigger value="interactive"> Interactive </TabsTrigger>
        <TabsTrigger value="across"> Across repositories </TabsTrigger>
      </TabsList>
      <TabsContent value="sequential">
        <CodeSnippet
          :code="sequential"
          title="Sequential — $transaction([…])"
          size="sm"
          :highlight="[2]"
        />
      </TabsContent>
      <TabsContent value="interactive">
        <CodeSnippet
          :code="interactive"
          title="Interactive — $transaction(async tx => …)"
          size="sm"
          :highlight="[2, 3, 7, 11]"
        />
      </TabsContent>
      <TabsContent value="across">
        <CodeSnippet
          :code="acrossRepositories"
          title="TransactionHost.run — repositories join automatically"
          size="sm"
          :highlight="[9, 10, 11]"
        />
      </TabsContent>
    </Tabs>

    <Alert>
      <TriangleAlert />
      <AlertTitle>Keep transactions short</AlertTitle>
      <AlertDescription>
        They hold a connection and row locks. No HTTP calls, no emails, no
        sleeps inside — enqueue that work after commit.
      </AlertDescription>
    </Alert>

    <Collapsible class="flex flex-col gap-3">
      <CollapsibleTrigger as-child>
        <Button variant="outline" class="w-fit">
          <ChevronsUpDown data-icon="inline-start" />
          Real story from this repo: a rename that would have wiped production
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CodeSnippet
          :code="migrationFix"
          lang="sql"
          title="db/migrations/20261025164624/migration.sql"
          size="sm"
          :highlight="[2, 8, 9]"
        />
      </CollapsibleContent>
    </Collapsible>
  </SlideLayout>
</template>
