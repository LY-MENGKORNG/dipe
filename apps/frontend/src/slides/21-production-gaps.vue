<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "Production gaps in our own repo",
  section: "Live demo",
  notes: [
    "Strong teaching moment: real findings from this codebase, not textbook examples. Each one maps back to a section.",
    "Secrets in code: app.module.ts passes the Observe appKey/appSecret as string literals, while env.ts already declares OBSERVE_APP_KEY / OBSERVE_APP_SECRET. Rotate those keys — they are in git history now.",
    'env.ts ends with `.refine(env => env.NODE_ENV !== "production")` — the app refuses to boot in production. Probably a leftover from testing.',
    "Validation: Zod DTOs exist but no ZodValidationPipe is registered, so bad input reaches the service unchecked.",
    "Data exposure: findAll returns every column, including password_hash.",
    'IDs: `+id` turns "abc" into NaN. Use ParseIntPipe → clean 400.',
    "Guard: UsersGuard always returns true. Fine as scaffolding, dangerous if someone wires it believing it protects something.",
  ],
  ask: "Which of these would you fix first, and why?",
}
</script>

<script setup lang="ts">
import { KeyRound, ShieldAlert, TriangleAlert } from "@lucide/vue"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const gaps = [
  {
    icon: KeyRound,
    severity: "critical",
    title: "Secrets hard-coded in app.module.ts",
    where: "ObserveModule.forRoot({ appKey, appSecret })",
    fix: "Read from env (schema already has OBSERVE_APP_*) and rotate the keys.",
  },
  {
    icon: TriangleAlert,
    severity: "critical",
    title: "App cannot boot in production",
    where: 'packages/env — .refine(env => env.NODE_ENV !== "production")',
    fix: "Remove the refine, or replace it with a real production check.",
  },
  {
    icon: ShieldAlert,
    severity: "high",
    title: "DTOs are documented but not validated",
    where: "no global ZodValidationPipe",
    fix: "{ provide: APP_PIPE, useClass: ZodValidationPipe }",
  },
  {
    icon: ShieldAlert,
    severity: "high",
    title: "password_hash leaves the database",
    where: "UserRepository.findMany()",
    fix: "select a public projection, or Prisma omit.",
  },
  {
    icon: TriangleAlert,
    severity: "medium",
    title: "IDs parsed with +id",
    where: "UsersController.findOne / update / remove",
    fix: '@Param("id", ParseIntPipe) → 400 instead of NaN.',
  },
  {
    icon: TriangleAlert,
    severity: "medium",
    title: "Placeholder guard allows everything",
    where: "users.guard.ts → return true",
    fix: "Replace with AuthGuard + RolesGuard (Security section).",
  },
]
</script>

<template>
  <SlideLayout
    section="Live demo"
    title="Production gaps in our own repo"
    subtitle="Real findings from this codebase — each one maps to a section of today."
  >
    <div class="grid gap-3 md:grid-cols-2">
      <Alert
        v-for="gap in gaps"
        :key="gap.title"
        :variant="gap.severity === 'critical' ? 'destructive' : 'default'"
      >
        <component :is="gap.icon" />
        <AlertTitle class="flex items-center justify-between gap-2">
          {{ gap.title }}
          <Badge
            :variant="
              gap.severity === 'critical'
                ? 'destructive'
                : gap.severity === 'high'
                  ? 'default'
                  : 'outline'
            "
          >
            {{ gap.severity }}
          </Badge>
        </AlertTitle>
        <AlertDescription>
          <code class="font-mono text-xs">{{ gap.where }}</code>
          <p>→ {{ gap.fix }}</p>
        </AlertDescription>
      </Alert>
    </div>
  </SlideLayout>
</template>
