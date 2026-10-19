<script lang="ts">
import type { SlideMeta } from '.'

export const meta: SlideMeta = {
  title: 'Calling external APIs',
  section: 'HTTP Client & External APIs',
  notes: [
    'Our API is now a client of someone else\'s API. Everything that can go wrong on our side can go wrong on theirs — plus the network.',
    'Wrap every third-party API in one injectable class. The rest of the app calls `github.getUser()` and never sees URLs or headers.',
    'Auth headers: secrets come from config/env, never hard-coded, never logged. Bearer token in Authorization, or an API-key header depending on the provider.',
    'Timeouts: fetch has NO timeout by default — a hung upstream hangs your request forever. `AbortSignal.timeout(ms)` is one line.',
    'Validate the response with Zod. You do not control their schema; parse it at the boundary so a surprise becomes a clear error, not `undefined` three layers deeper.',
    'Native fetch is enough on Bun/Node 18+. @nestjs/axios is fine too if the team prefers interceptors — the principles are identical. A good home for this is the `@repo/http` package.',
  ],
}
</script>

<script setup lang="ts">
import { Clock, KeyRound, ShieldCheck, Waypoints } from '@lucide/vue'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'
import CodeSnippet from '@/components/deck/CodeSnippet.vue'
import SlideLayout from '@/components/deck/SlideLayout.vue'

const rules = [
  { icon: Waypoints, title: 'One client per provider', desc: 'Injectable class; URLs and headers stay inside.' },
  { icon: KeyRound, title: 'Auth from config', desc: 'Token via ConfigService / env. Never in code or logs.' },
  { icon: Clock, title: 'Always a timeout', desc: 'fetch waits forever by default. @repo/http: timeout + retry.' },
  { icon: ShieldCheck, title: 'Validate the response', desc: 'Zod-parse at the boundary — trust nothing.' },
]

const code = `
  import { http, type HttpInstance } from "@repo/http"; // derived from Ky

  @Injectable()
  export class GithubClient {
    private readonly http: HttpInstance;

    constructor(config: ConfigService<Env, true>) {
      const token = config.get("GITHUB_TOKEN", { infer: true });

      this.http = http.create({
        baseUrl: "https://api.github.com/",
        timeout: 3_000,
        retry: { limit: 2, backoffLimit: 2_000 },
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "dipe-api",
          ...(token && { Authorization: \`Bearer \${token}\` }),
        },
      });
    }

    getUser(username: string) {
      return this.http
        .get(\`users/\${encodeURIComponent(username)}\`)
        .json(githubUserSchema); // Zod schema → SchemaValidationError
    }
  }
`
</script>

<template>
  <SlideLayout
    section="HTTP Client & External APIs"
    title="Calling external APIs"
    subtitle="Treat every third-party API as slow, flaky and untrusted — then wrap it so nobody else has to care."
  >
    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <ItemGroup class="gap-2">
        <Item v-for="rule in rules" :key="rule.title" variant="outline">
          <ItemMedia variant="icon">
            <component :is="rule.icon" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{{ rule.title }}</ItemTitle>
            <ItemDescription>{{ rule.desc }}</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
      <CodeSnippet :code="code" title="src/modules/github/github.client.ts" size="sm" :highlight="[11, 12, 13, 17, 25]" />
    </div>
  </SlideLayout>
</template>
