<script lang="ts">
import type { SlideMeta } from '.'

export const meta: SlideMeta = {
  title: 'Headers, CORS, CSRF & rate limiting',
  section: 'Security',
  notes: [
    'Four browser-and-abuse protections, each a few lines on Fastify.',
    'Security headers (@fastify/helmet): HSTS, X-Content-Type-Options, frame-ancestors… Free hardening. Content-Security-Policy needs tuning if you serve HTML like the /docs page.',
    'CORS is NOT a security wall for your API — it only tells BROWSERS which origins may read responses. curl ignores it. The repo already configures it in main.ts from ALLOW_ORIGINS — never use "*" together with credentials.',
    'CSRF only matters when the browser sends credentials automatically, i.e. cookies. With Bearer tokens in a header, a malicious site cannot attach them, so CSRF does not apply. If you move to cookie sessions: SameSite=Lax/Strict + CSRF token.',
    'Rate limiting (@nestjs/throttler): protects login from brute force and the API from accidental floods. Tighter limit on /auth/login than on the rest.',
    'Behind a proxy/load balancer, configure trustProxy so the limiter sees the real client IP, not the proxy\'s.',
  ],
  ask: 'We set CORS origin to our frontend only. Can a script with curl still call our API?',
}
</script>

<script setup lang="ts">
import { Info } from '@lucide/vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CodeSnippet from '@/components/deck/CodeSnippet.vue'
import SlideLayout from '@/components/deck/SlideLayout.vue'

const tabs = [
  {
    value: 'helmet',
    label: 'Security headers',
    title: 'main.ts — @fastify/helmet',
    highlight: [3, 4, 5],
    note: 'Adds HSTS, nosniff, frame and referrer policies to every response.',
    code: `
      import helmet from "@fastify/helmet";

      await app.register(helmet, {
        contentSecurityPolicy: false, // or tune it: /docs serves HTML + scripts
      });

      // → Strict-Transport-Security, X-Content-Type-Options: nosniff,
      //   X-Frame-Options: SAMEORIGIN, Referrer-Policy: no-referrer, …
    `,
  },
  {
    value: 'cors',
    label: 'CORS',
    title: 'src/main.ts (already in the repo)',
    highlight: [4],
    note: 'Tells browsers which origins may read responses. Not an auth mechanism.',
    code: `
      const app = await safeTry(
        NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
          instrument: ObserveInstrument,
          cors: { origin: env.ALLOW_ORIGINS, methods: requestMethods as string[] },
          snapshot: true,
        }),
      );
      // ALLOW_ORIGINS="http://localhost:5173,https://app.example.com"
    `,
  },
  {
    value: 'csrf',
    label: 'CSRF',
    title: 'only when auth uses cookies',
    highlight: [5, 6],
    note: 'Bearer token in a header? CSRF does not apply. Cookies? SameSite + CSRF token.',
    code: `
      import fastifyCookie from "@fastify/cookie";
      import fastifyCsrf from "@fastify/csrf-protection";

      await app.register(fastifyCookie, { secret: env.COOKIE_SECRET });
      await app.register(fastifyCsrf, {
        cookieOpts: { signed: true, sameSite: "strict", httpOnly: true },
      });
      // GET /csrf → reply.generateCsrf(); client echoes it in x-csrf-token
    `,
  },
  {
    value: 'throttle',
    label: 'Rate limiting',
    title: '@nestjs/throttler',
    highlight: [3, 5, 8],
    note: 'Global default plus a stricter limit on login to slow brute force.',
    code: `
      // app.module.ts
      imports: [
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]), // 100 req/min
      ],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],

      // auth.controller.ts
      @Throttle({ default: { ttl: 60_000, limit: 5 } })     // 5 logins/min
      @Post("login")
      login(@Body() dto: LoginDto) { … }                    // → 429 when exceeded
    `,
  },
]
</script>

<template>
  <SlideLayout
    section="Security"
    title="Headers, CORS, CSRF & rate limiting"
    subtitle="Cheap protections for the browser and against abuse — each a few lines on Fastify."
  >
    <Tabs default-value="helmet">
      <TabsList>
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value" class="flex flex-col gap-4">
        <Alert>
          <Info />
          <AlertTitle>{{ tab.label }}</AlertTitle>
          <AlertDescription>{{ tab.note }}</AlertDescription>
        </Alert>
        <CodeSnippet :code="tab.code" :title="tab.title" :highlight="tab.highlight" />
      </TabsContent>
    </Tabs>
  </SlideLayout>
</template>
