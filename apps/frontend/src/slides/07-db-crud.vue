<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "CRUD with Prisma",
  section: "Database & ORM",
  notes: [
    "Left: how REST routes map to Prisma calls. Right: the code for each.",
    "`omit` (Prisma 7) or `select` decides which columns leave the database. Never return passwordHash — the repo uses `omit: { passwordHash: true }` on every user query.",
    "Pagination: take/skip is fine for small tables; cursor pagination for big or infinite-scroll lists.",
    "`include` loads relations in one call — GET /users/:id/workspaces pulls the user, their memberships and owned workspaces in one query, no N+1.",
    "Join-model shape: include returns `workspaces: [{ userId, workspaceId, workspace: {…} }]`. The service flattens it to the workspace objects before the Zod response schema serializes it.",
    "Errors: Prisma throws known codes. P2002 = unique constraint (email already used → 409), P2025 = record not found (→ 404). Map them, do not leak 500s.",
  ],
  ask: 'What status code should "email already exists" return?',
}
</script>

<script setup lang="ts">
import { Badge, type BadgeVariants } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CodeSnippet from "@/components/deck/CodeSnippet.vue"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const routes: {
  verb: string
  path: string
  call: string
  variant: BadgeVariants["variant"]
}[] = [
  { verb: "POST", path: "/users", call: "user.create", variant: "default" },
  { verb: "GET", path: "/users", call: "user.findMany", variant: "secondary" },
  {
    verb: "GET",
    path: "/users/:id",
    call: "user.findUnique",
    variant: "secondary",
  },
  {
    verb: "GET",
    path: "/users/:id/workspaces",
    call: "user.findUnique + include",
    variant: "secondary",
  },
  {
    verb: "PATCH",
    path: "/users/:id",
    call: "user.update",
    variant: "outline",
  },
  {
    verb: "DELETE",
    path: "/users/:id",
    call: "user.delete",
    variant: "destructive",
  },
]

const ops = [
  {
    value: "create",
    code: `
      create(data: Prisma.UserCreateInput) {
        return this.db.user.create({
          data,
          omit: { passwordHash: true },  // never return the hash
        });
      }
    `,
    highlight: [4],
  },
  {
    value: "read",
    code: `
      findMany({ q, role, limit, offset }: ListUserQuery) {
        return this.db.user.findMany({
          where: {
            role,
            ...(q && { name: { contains: q, mode: "insensitive" } }),
          },
          omit: { passwordHash: true },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        });
      }

      findByIdWithWorkspaces(id: number) {
        return this.db.user.findUnique({
          where: { id },
          omit: { passwordHash: true },
          include: {
            workspaces: { include: { workspace: true } },  // via WorkspaceMember
            createdWorkspaces: { omit: { ownerId: true } }, // owned (1-n)
          },
        });
      }
    `,
    highlight: [9, 10, 18, 19],
  },
  {
    value: "update",
    code: `
      update(id: number, data: UpdateUserDto) {
        return this.db.user.update({
          where: { id },
          data,                // only the fields that were sent
          omit: { passwordHash: true },
        });
      }
    `,
    highlight: [3, 4],
  },
  {
    value: "delete",
    code: `
      remove(id: number) {
        return this.db.user.delete({ where: { id } });
      }

      // or soft delete — keeps history, FK-safe
      deactivate(id: number) {
        return this.db.user.update({ where: { id }, data: { isActive: false } });
      }
    `,
    highlight: [6, 7, 8],
  },
  {
    value: "errors",
    code: `
      import { Prisma } from "@config/db/generated/client";

      try {
        return await this.repository.create(dto, hash);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") throw new ConflictException("Email already used");
          if (e.code === "P2025") throw new NotFoundException();
        }
        throw e;
      }
    `,
    highlight: [7, 8],
  },
]
</script>

<template>
  <SlideLayout
    section="Database & ORM"
    title="CRUD with Prisma"
    subtitle="Each REST route maps to one typed Prisma call — plus omit, include, pagination and error mapping."
  >
    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Verb</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Prisma</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="route in routes" :key="route.verb + route.path">
            <TableCell>
              <Badge :variant="route.variant">
                {{ route.verb }}
              </Badge>
            </TableCell>
            <TableCell class="font-mono text-xs">
              {{ route.path }}
            </TableCell>
            <TableCell class="font-mono text-xs">
              {{ route.call }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Tabs default-value="create" class="min-w-0">
        <TabsList>
          <TabsTrigger
            v-for="op in ops"
            :key="op.value"
            :value="op.value"
            class="capitalize"
          >
            {{ op.value }}
          </TabsTrigger>
        </TabsList>
        <TabsContent v-for="op in ops" :key="op.value" :value="op.value">
          <CodeSnippet
            :code="op.code"
            title="users.repository.ts"
            size="sm"
            :highlight="op.highlight"
          />
        </TabsContent>
      </Tabs>
    </div>
  </SlideLayout>
</template>
