<script lang="ts">
import type { SlideMeta } from '.'

export const meta: SlideMeta = {
  title: 'CRUD with Prisma',
  section: 'Database & ORM',
  notes: [
    'Left: how REST routes map to Prisma calls. Right: the code for each.',
    '`select` decides which columns leave the database. Never return password_hash — define a reusable `publicUser` select (or use Prisma 7 `omit`).',
    'Pagination: take/skip is fine for small tables; cursor pagination for big or infinite-scroll lists.',
    '`include` loads relations (posts of a user) in one call — avoids N+1 queries.',
    'Errors: Prisma throws known codes. P2002 = unique constraint (email already used → 409), P2025 = record not found (→ 404). Map them, do not leak 500s.',
    'Today the repo `findAll` returns every column including password_hash — fix it live as the first demo step.',
  ],
  ask: 'What status code should "email already exists" return?',
}
</script>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CodeSnippet from '@/components/deck/CodeSnippet.vue'
import SlideLayout from '@/components/deck/SlideLayout.vue'

const routes = [
  { verb: 'POST', path: '/users', call: 'user.create' },
  { verb: 'GET', path: '/users', call: 'user.findMany' },
  { verb: 'GET', path: '/users/:id', call: 'user.findUnique' },
  { verb: 'PATCH', path: '/users/:id', call: 'user.update' },
  { verb: 'DELETE', path: '/users/:id', call: 'user.delete' },
]

const ops = [
  {
    value: 'create',
    code: `
      const publicUser = { id: true, name: true, email: true, role: true } as const;

      create(data: CreateUserDto, passwordHash: string) {
        return this.db.user.create({
          data: { name: data.name, email: data.email, password_hash: passwordHash },
          select: publicUser,            // never return password_hash
        });
      }
    `,
    highlight: [1, 6],
  },
  {
    value: 'read',
    code: `
      findMany({ q, role, limit, offset }: ListUserQuery) {
        return this.db.user.findMany({
          where: {
            role,
            ...(q && { name: { contains: q, mode: "insensitive" } }),
          },
          select: publicUser,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        });
      }

      findOne(id: number) {
        return this.db.user.findUnique({
          where: { id },
          include: { postedPosts: true },  // relation in one query
        });
      }
    `,
    highlight: [9, 10, 17],
  },
  {
    value: 'update',
    code: `
      update(id: number, data: UpdateUserDto) {
        return this.db.user.update({
          where: { id },
          data,                // only the fields that were sent
          select: publicUser,
        });
      }
    `,
    highlight: [3, 4],
  },
  {
    value: 'delete',
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
    value: 'errors',
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
    subtitle="Each REST route maps to one typed Prisma call — plus select, pagination and error mapping."
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
              <Badge :variant="route.verb === 'DELETE' ? 'destructive' : route.verb === 'GET' ? 'secondary' : 'default'">
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
          <TabsTrigger v-for="op in ops" :key="op.value" :value="op.value" class="capitalize">
            {{ op.value }}
          </TabsTrigger>
        </TabsList>
        <TabsContent v-for="op in ops" :key="op.value" :value="op.value">
          <CodeSnippet :code="op.code" title="users.repository.ts" size="sm" :highlight="op.highlight" />
        </TabsContent>
      </Tabs>
    </div>
  </SlideLayout>
</template>
