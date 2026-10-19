<script lang="ts">
import type { SlideMeta } from '.'

export const meta: SlideMeta = {
  title: 'Data, Integration & Production Essentials',
  section: 'Intro',
  notes: [
    'Welcome. Over two hours we take a small NestJS API from "it runs" to "it is reliable enough to ship".',
    'Everything you see is built on the stack in this repo: NestJS on Fastify, Prisma 7 with the pg adapter, PostgreSQL, running on Bun.',
    'Promise of the session: by the end we will have a Postgres-backed API, one outbound HTTP call, a protected endpoint, a passing test, and live docs.',
    'Navigation tips for you: ← → to move, O for overview, N for these notes, F for fullscreen.',
  ],
}
</script>

<script setup lang="ts">
import { Database, Globe, ListTodo, ShieldCheck, TestTubeDiagonal, BookOpenText } from '@lucide/vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const stack = ['NestJS 12', 'Fastify', 'Prisma 7', 'PostgreSQL', 'Redis · BullMQ', 'Bun']
const topics = [
  { icon: Database, label: 'Database & ORM' },
  { icon: Globe, label: 'HTTP & external APIs' },
  { icon: ListTodo, label: 'Events & queues' },
  { icon: ShieldCheck, label: 'Security' },
  { icon: TestTubeDiagonal, label: 'Testing' },
  { icon: BookOpenText, label: 'OpenAPI & Swagger' },
]
</script>

<template>
  <section class="mx-auto flex w-full max-w-5xl flex-col items-start gap-8 px-6 py-12 md:px-10">
    <Badge variant="outline" class="stagger">
      NestJS workshop · 2 hours
    </Badge>
    <h1 class="stagger font-heading text-4xl font-bold tracking-tight text-balance md:text-6xl">
      Data, Integration &amp; Production Essentials
    </h1>
    <p class="stagger max-w-2xl text-lg text-muted-foreground md:text-xl">
      How NestJS talks to databases and external services — and how to build, protect, test and document an API you can trust.
    </p>
    <div class="stagger flex flex-wrap gap-2">
      <Badge v-for="item in stack" :key="item" variant="secondary">
        {{ item }}
      </Badge>
    </div>
    <Separator class="stagger" />
    <div class="stagger grid w-full grid-cols-2 gap-4 text-sm text-muted-foreground md:grid-cols-6">
      <div v-for="topic in topics" :key="topic.label" class="flex flex-col gap-2">
        <component :is="topic.icon" class="size-5 text-foreground" />
        {{ topic.label }}
      </div>
    </div>
    <div class="stagger flex items-center gap-3">
      <Avatar>
        <AvatarFallback>ML</AvatarFallback>
      </Avatar>
      <div class="flex flex-col">
        <span class="text-sm font-medium">Mengkorng Ly</span>
        <span class="text-xs text-muted-foreground">DIPE · demo project</span>
      </div>
    </div>
  </section>
</template>
