<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "E2E test over HTTP",
  section: "Testing",
  notes: [
    "We boot the real AppModule on the real Fastify adapter. Everything runs: guards, pipes, controllers, services.",
    "app.inject() is Fastify's light-my-request — it simulates an HTTP request without opening a port. Faster than supertest and no port conflicts.",
    "overrideProvider swaps external dependencies only: the GitHub client (no internet) and the mailer (no real emails). The database is real — the DATABASE_URL from .env. Each file seeds its own users with unique emails and deletes them in afterAll, so runs never collide. In a real team, point it at a dedicated test database.",
    "One file per feature in test/e2e/ (auth, users, workspaces, queue, github). They all boot through the same bootApp() in test/e2e/app.ts, so the wiring lives in one place.",
    'Test the security contract explicitly: no token → 401, wrong role → 403, right role → 200. This is the proof for the "protected endpoint" part of the demo.',
    "Always close the app in afterAll, or the test runner hangs on the open DB pool — useE2E() does it for every file.",
  ],
  ask: "Why do we override the GitHub client but not the database?",
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
import CodeSnippet from "@/components/deck/CodeSnippet.vue"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const code = `
  // test/e2e/app.ts — shared by every *.e2e.spec.ts
  export const bootApp = async (overrides) => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(GithubClient)
      .useValue(overrides.github)
      .overrideProvider(MailerService)
      .useValue(overrides.mailer)
      .compile()

    const app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    app.setGlobalPrefix("/api")
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    return app
  }

  // test/e2e/users.e2e.spec.ts
  describe("Users (e2e)", () => {
    const t = useE2E("users")   // seeds admin/employee, boots the app, closes it in afterAll

    it("rejects anonymous users with 401", async () => {
      const res = await t.app.inject({ method: "GET", url: "/api/users" })
      expect(res.statusCode).toBe(401)
    })

    it("lists users for an admin", async () => {
      const res = await t.app.inject({
        method: "GET",
        url: "/api/users?limit=5",
        headers: as(t.admin),
      })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ limit: 5, offset: 0 })
    })
  })
`

const checks = [
  { req: "GET /api/users", auth: "none", expect: "401" },
  { req: "DELETE /api/users/:id", auth: "employee", expect: "403" },
  { req: "GET /api/users", auth: "admin", expect: "200" },
  { req: "POST /api/users (bad email)", auth: "admin", expect: "400" },
]
</script>

<template>
  <SlideLayout
    section="Testing"
    title="E2E test over HTTP"
    subtitle="Boot the real app, fake only the outside world, and assert on status codes."
  >
    <div class="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <CodeSnippet
        :code="code"
        title="test/e2e/app.ts · test/e2e/users.e2e.spec.ts"
        size="sm"
        :highlight="[4, 5, 6, 7, 19, 22, 23, 32]"
      />
      <Card>
        <CardHeader>
          <CardTitle>The security contract</CardTitle>
          <CardDescription>Cases worth one E2E test each.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-3">
          <div
            v-for="check in checks"
            :key="check.req + check.auth"
            class="flex items-center justify-between gap-3 text-sm"
          >
            <div class="flex min-w-0 flex-col">
              <span class="truncate font-mono text-xs">{{ check.req }}</span>
              <span class="text-xs text-muted-foreground"
                >as {{ check.auth }}</span
              >
            </div>
            <Badge
              :variant="check.expect === '200' ? 'default' : 'destructive'"
            >
              {{ check.expect }}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  </SlideLayout>
</template>
