<script lang="ts">
import type { SlideMeta } from '.'

export const meta: SlideMeta = {
  title: 'The life of a request',
  section: 'Intro',
  notes: [
    'Every topic today plugs into one stage of this pipeline. Keep pointing back to this slide.',
    'Middleware/Fastify hooks run first: security headers, CORS, rate limiting. They do not know about Nest routes.',
    'Guards answer "may this request continue?" — that is where authentication and authorization live. Our repo already has an empty users.guard.ts.',
    'Pipes transform and validate input (users.pipe.ts). With nestjs-zod, the Zod schema in the DTO is the validation.',
    'Controller = HTTP shape only. Service = business rules. Repository = data access through Prisma. Keep those boundaries thin and honest.',
    'Side exits: the service may call an external API (HTTP client) or hand slow work to a queue instead of doing it inline.',
  ],
  ask: 'If a user without a token calls GET /users, which box should reject them — and with which status code?',
}
</script>

<script setup lang="ts">
import { ArrowDown, ArrowRight } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import SlideLayout from '@/components/deck/SlideLayout.vue'

const stages = [
  { name: 'Middleware', detail: 'helmet · CORS · rate limit', topic: 'Security' },
  { name: 'Guard', detail: 'who are you? may you?', topic: 'Security' },
  { name: 'Pipe', detail: 'validate & transform DTO', topic: 'OpenAPI' },
  { name: 'Controller', detail: 'HTTP in / HTTP out', topic: 'OpenAPI' },
  { name: 'Service', detail: 'business rules', topic: 'Testing' },
  { name: 'Repository', detail: 'Prisma queries', topic: 'Database' },
]

const exits = [
  { name: 'PostgreSQL', detail: 'source of truth, via Prisma + pg adapter', topic: 'Database' },
  { name: 'External API', detail: 'fetch with auth headers, timeouts, retries', topic: 'HTTP' },
  { name: 'Redis · BullMQ', detail: 'slow / retryable work, done by a worker', topic: 'Queues' },
]
</script>

<template>
  <SlideLayout
    section="Intro"
    title="The life of a request"
    subtitle="Every topic today hooks into one stage of this pipeline."
  >
    <div class="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
      <template v-for="(stage, i) in stages" :key="stage.name">
        <Item variant="outline" class="flex-1 lg:flex-col lg:items-start">
          <ItemContent>
            <ItemTitle>{{ stage.name }}</ItemTitle>
            <ItemDescription>{{ stage.detail }}</ItemDescription>
          </ItemContent>
          <Badge variant="secondary">
            {{ stage.topic }}
          </Badge>
        </Item>
        <template v-if="i < stages.length - 1">
          <ArrowRight class="hidden size-4 shrink-0 text-muted-foreground lg:block" />
          <ArrowDown class="mx-auto size-4 shrink-0 text-muted-foreground lg:hidden" />
        </template>
      </template>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <Card v-for="exit in exits" :key="exit.name">
        <CardHeader>
          <CardTitle class="flex items-center justify-between gap-2">
            {{ exit.name }}
            <Badge variant="outline">
              {{ exit.topic }}
            </Badge>
          </CardTitle>
          <CardDescription>{{ exit.detail }}</CardDescription>
        </CardHeader>
        <CardContent class="text-xs text-muted-foreground">
          called from the Service / Repository layer
        </CardContent>
      </Card>
    </div>
  </SlideLayout>
</template>
