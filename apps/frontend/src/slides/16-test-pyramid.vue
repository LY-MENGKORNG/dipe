<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "The testing pyramid",
  section: "Testing",
  notes: [
    "Unit tests: one class, all dependencies mocked. Milliseconds each, so we can have hundreds. They test logic, not wiring.",
    "Integration tests: a few real pieces together — the repository against a real Postgres, no HTTP. Test.createTestingModule imports only DBModule plus the repository under test. They catch wrong queries, missing constraints and broken migrations, which mocks never will.",
    "Every tier has its own folder under test/ — unit, integration, e2e — so test code never sits next to production code and each tier has its own script.",
    "E2E tests: boot the whole Nest app and send real HTTP requests. Slow-ish, so test the important journeys: login, create user, protected route returns 401/403.",
    "Mocking = replacing a dependency with a fake you control. Mock what is slow or external (DB in unit tests, GitHub API everywhere). Do not mock the thing you are testing.",
    "This repo uses `bun test` (Jest-compatible API: describe/it/expect/mock) — no Jest config needed.",
    "Coverage is a flashlight, not a target. 100% coverage with no assertions proves nothing. Look at what is NOT covered.",
  ],
}
</script>

<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import CodeSnippet from "@/components/deck/CodeSnippet.vue"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const tiers = [
  {
    name: "E2E",
    share: 10,
    speed: "seconds",
    scope: "Whole app over HTTP",
    tools: "Test.createTestingModule + app.inject()",
    width: "lg:w-2/5",
  },
  {
    name: "Integration",
    share: 25,
    speed: "100s of ms",
    scope: "Repository + real Postgres",
    tools: "DBModule + repository, real Postgres",
    width: "lg:w-3/5",
  },
  {
    name: "Unit",
    share: 65,
    speed: "ms",
    scope: "One class, deps mocked",
    tools: "bun:test · mock()",
    width: "lg:w-full",
  },
]

const commands = `
  bun run test                     # run everything
  bun run test:unit                # test/unit         (no DB needed)
  bun run test:int                 # test/integration  (needs Postgres)
  bun run test:e2e                 # test/e2e          (needs Postgres + Redis)
  bun test users                   # filter by file name
  bun test --coverage              # line / function coverage table
`
</script>

<template>
  <SlideLayout
    section="Testing"
    title="The testing pyramid"
    subtitle="Many fast unit tests, some integration tests, a few end-to-end journeys."
  >
    <div class="flex flex-col items-center gap-3">
      <Card
        v-for="tier in tiers"
        :key="tier.name"
        size="sm"
        :class="['w-full', tier.width]"
      >
        <CardHeader>
          <CardTitle class="flex items-center justify-between gap-2">
            {{ tier.name }}
            <span class="flex gap-1.5">
              <Badge variant="outline">{{ tier.speed }}</Badge>
              <Badge variant="secondary">~{{ tier.share }}% of tests</Badge>
            </span>
          </CardTitle>
          <CardDescription
            >{{ tier.scope }} —
            <span class="font-mono text-xs">{{
              tier.tools
            }}</span></CardDescription
          >
        </CardHeader>
        <CardContent>
          <Progress :model-value="tier.share" />
        </CardContent>
      </Card>
    </div>
    <CodeSnippet
      :code="commands"
      lang="bash"
      title="apps/backend — bun test"
      size="sm"
    />
  </SlideLayout>
</template>
