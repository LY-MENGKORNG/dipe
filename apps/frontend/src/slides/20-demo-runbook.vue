<script lang="ts">
import type { SlideMeta } from '.'

export const meta: SlideMeta = {
  title: 'Live demo runbook',
  section: 'Live demo',
  notes: [
    'Rehearse this exact order at least twice. Each step proves one line of the "expected demo".',
    'Before the session: Postgres and Redis running (brew services start redis), migrations applied, demo users seeded, a token copied somewhere. Live typing of setup steps is where demos die.',
    'Keep a terminal with `bun test` ready — running the test live is a strong closer for the testing section.',
    'Plan B for every network step: if GitHub is unreachable, show the E2E test where GithubClient is mocked and explain why that test still passes.',
    'Seeded logins: admin@dipe.dev / Admin@12345 and employee@dipe.dev / Employee@12345 — the employee token is how you show a 403 on POST /api/users.',
  ],
}
</script>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'
import { ScrollArea } from '@/components/ui/scroll-area'
import SlideLayout from '@/components/deck/SlideLayout.vue'

const steps = [
  { title: 'Check Postgres & Redis are up', cmd: 'pg_isready -h localhost && redis-cli ping', proves: 'setup' },
  { title: 'Migrate & seed demo users', cmd: 'bun run db:migrate:dev && bun run db:seed', proves: 'Prisma' },
  { title: 'Run the API', cmd: 'bun run dev   # → http://localhost:3000/api', proves: 'Nest' },
  { title: 'Open the docs', cmd: 'open http://localhost:3000/docs', proves: 'OpenAPI' },
  { title: 'Call a protected route anonymously', cmd: 'curl -i localhost:3000/api/users   # → 401', proves: 'Security' },
  { title: 'Log in, then call it with a token', cmd: 'curl -X POST localhost:3000/api/auth/login -H "content-type: application/json" -d \'{"email":"admin@dipe.dev","password":"Admin@12345"}\'', proves: 'Security' },
  { title: 'Hit the external API', cmd: 'curl -H "Authorization: Bearer $TOKEN" localhost:3000/api/github/users/octocat', proves: 'HTTP client' },
  { title: 'Run the tests', cmd: 'bun run test   # unit + e2e', proves: 'Testing' },
]
</script>

<template>
  <SlideLayout
    section="Live demo"
    title="Live demo runbook"
    subtitle="Eight steps, each one proving a line of the expected demo."
  >
    <ScrollArea class="max-h-[60vh]">
      <ItemGroup class="gap-2 pe-3">
        <Item v-for="(step, i) in steps" :key="step.title" variant="outline" size="sm">
          <ItemMedia>
            <Badge variant="secondary" class="tabular-nums">
              {{ i + 1 }}
            </Badge>
          </ItemMedia>
          <ItemContent class="min-w-0">
            <ItemTitle>{{ step.title }}</ItemTitle>
            <ItemDescription class="truncate font-mono text-xs">
              {{ step.cmd }}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Badge variant="outline">
              {{ step.proves }}
            </Badge>
          </ItemActions>
        </Item>
      </ItemGroup>
    </ScrollArea>
  </SlideLayout>
</template>
