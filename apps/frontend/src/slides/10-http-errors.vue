<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "When the other side fails",
  section: "HTTP Client & External APIs",
  notes: [
    "Classify failures before reacting. Only retry what can succeed on a second try: timeouts, network errors, 5xx, 429.",
    "Never retry 4xx (except 429): a bad request stays bad. Retrying a 401 just burns rate limit.",
    "Backoff with jitter: wait 200ms, 400ms, 800ms… plus randomness, so a thousand clients do not retry in lockstep.",
    'Retries are only safe for idempotent calls (GET, PUT, DELETE). Retrying a POST "charge card" can charge twice — use idempotency keys.',
    "Translate errors for OUR clients: upstream down → 502 Bad Gateway, upstream timeout → 504 Gateway Timeout. Do not return a 500 and do not leak their error body.",
    "Bonus concept: circuit breaker — after N failures stop calling for a while and fail fast. Mention it, do not build it today.",
  ],
  ask: "Is it safe to automatically retry POST /payments? What would make it safe?",
}
</script>

<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CodeSnippet from "@/components/deck/CodeSnippet.vue"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const cases = [
  { what: "Timeout / network error", retry: true, ours: "504 Gateway Timeout" },
  { what: "5xx from upstream", retry: true, ours: "502 Bad Gateway" },
  {
    what: "429 Too Many Requests",
    retry: true,
    ours: "wait Retry-After, then 503",
  },
  {
    what: "401 / 403 from upstream",
    retry: false,
    ours: "502 + alert: our token is broken",
  },
  {
    what: "404 from upstream",
    retry: false,
    ours: '404 (if it means "no such thing")',
  },
  {
    what: "Response fails Zod parse",
    retry: false,
    ours: "502 + log the payload shape",
  },
]

const code = `
  // @repo/http retries GET 408/413/429/500/502/503/504 + network errors,
  // with exponential backoff and Retry-After support. We just map
  // whatever is left into a status for OUR clients:
  @Catch(HttpClientError, SchemaValidationError)
  export class UpstreamExceptionFilter implements ExceptionFilter {
    catch(exception: HttpClientError | SchemaValidationError, host: ArgumentsHost) {
      const reply = host.switchToHttp().getResponse<FastifyReply>();

      if (isHTTPError(exception) && exception.response.status === 404)
        return void reply.status(404).send({ message: "Not found upstream" });

      const status = isTimeoutError(exception) ? 504 : 502;
      void reply.status(status).send({ statusCode: status, error: exception.name });
    }
  }
`
</script>

<template>
  <SlideLayout
    section="HTTP Client & External APIs"
    title="When the other side fails"
    subtitle="Retry only what can succeed next time, back off, and translate the failure for your own clients."
  >
    <div class="grid gap-6 lg:grid-cols-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Upstream says</TableHead>
            <TableHead>Retry?</TableHead>
            <TableHead>We answer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in cases" :key="row.what">
            <TableCell class="font-medium">
              {{ row.what }}
            </TableCell>
            <TableCell>
              <Badge :variant="row.retry ? 'default' : 'outline'">
                {{ row.retry ? "yes" : "no" }}
              </Badge>
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ row.ours }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <CodeSnippet
        :code="code"
        title="common/filters/upstream-exception.filter.ts"
        size="sm"
        :highlight="[4, 9, 12]"
      />
    </div>
  </SlideLayout>
</template>
