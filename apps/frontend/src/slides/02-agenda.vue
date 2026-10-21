<script lang="ts">
import type { SlideMeta } from '.'

export const meta: SlideMeta = {
  title: 'Agenda',
  section: 'Intro',
  notes: [
    'Six topics, each one ends with something concrete we add to the demo API.',
    'Time-box strictly: the live demo at the end is the payoff, protect those 15 minutes.',
    'Security gets the most time because it has the most "looks fine, is broken" traps.',
  ],
}
</script>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import SlideLayout from '@/components/deck/SlideLayout.vue'

const rows = [
  { topic: 'Intro & request lifecycle', outcome: 'Shared mental model', min: 10 },
  { topic: 'Database & ORM', outcome: 'Users + Posts in Postgres via Prisma', min: 25 },
  { topic: 'HTTP client & external APIs', outcome: 'Call a 3rd-party API safely', min: 15 },
  { topic: 'Events & queues', outcome: 'Send "welcome email" in the background', min: 10 },
  { topic: 'Security', outcome: 'Login + protected endpoint', min: 20 },
  { topic: 'Testing', outcome: 'One unit + one E2E test passing', min: 15 },
  { topic: 'API Documentation', outcome: 'How to build & document a reliable API', min: 10 },
  { topic: 'Live demo & Q&A', outcome: 'Run the whole thing end to end', min: 15 },
]
</script>

<template>
  <SlideLayout section="Intro" title="Agenda" subtitle="Two hours, six topics, one API that grows with every section.">
    <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-10">
              #
            </TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>What we add to the API</TableHead>
            <TableHead class="text-right">
              Min
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(row, i) in rows" :key="row.topic">
            <TableCell class="text-muted-foreground tabular-nums">
              {{ i + 1 }}
            </TableCell>
            <TableCell class="font-medium">
              {{ row.topic }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ row.outcome }}
            </TableCell>
            <TableCell class="text-right tabular-nums">
              {{ row.min }}
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colspan="3">
              Total
            </TableCell>
            <TableCell class="text-right tabular-nums">
              {{ rows.reduce((sum, r) => sum + r.min, 0) }}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Card>
        <CardHeader>
          <CardTitle>Expected demo</CardTitle>
          <CardDescription>What "done" looks like at the end of the session.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-2 text-sm">
          <div class="flex items-center gap-2">
            <Badge>1</Badge> PostgreSQL-backed API with Prisma
          </div>
          <div class="flex items-center gap-2">
            <Badge>2</Badge> An external HTTP request
          </div>
          <div class="flex items-center gap-2">
            <Badge>3</Badge> A protected endpoint
          </div>
          <div class="flex items-center gap-2">
            <Badge>4</Badge> A basic test that runs
          </div>
          <div class="flex items-center gap-2">
            <Badge>5</Badge> API documentation exposed
          </div>
        </CardContent>
      </Card>
    </div>
  </SlideLayout>
</template>
