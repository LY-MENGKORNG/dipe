<script lang="ts">
import type { SlideMeta } from '.'

export const meta: SlideMeta = {
  title: 'Background jobs with BullMQ',
  section: 'Events & Queues',
  notes: [
    'BullMQ stores jobs in Redis. A producer adds a job and returns immediately; a worker (same app or a separate process) picks it up.',
    'Click "Enqueue" a few times on the right to show the lifecycle: waiting → active → completed, and some fail then retry.',
    'attempts + backoff = automatic retries. removeOnComplete keeps Redis from growing forever.',
    'Jobs must be idempotent: a worker can crash after doing the work but before acknowledging it, so the job may run twice.',
    'Use a queue when: the work is slow (emails, PDFs, image resize), can fail and must be retried (3rd-party APIs), must be rate-limited, or must run later/scheduled.',
    'Do not use a queue for things the user must see in the response — that is just a slower synchronous call with extra steps.',
  ],
  ask: 'Our welcome email provider is down for 10 minutes. With a queue, what does the user experience? Without one?',
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Plus } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CodeSnippet from '@/components/deck/CodeSnippet.vue'
import SlideLayout from '@/components/deck/SlideLayout.vue'

const producer = `
  // users.module.ts
  imports: [BullModule.registerQueue({ name: "email" })]

  // users.service.ts
  constructor(@InjectQueue("email") private readonly emailQueue: Queue) {}

  async create(dto: CreateUserDto) {
    const user = await this.repository.create(dto, hash);
    await this.emailQueue.add("welcome", { userId: user.id }, {
      attempts: 5,
      backoff: { type: "exponential", delay: 1_000 },
      removeOnComplete: true,
    });
    return user; // responds immediately ⚡
  }
`

const worker = `
  @Processor("email", { concurrency: 5 })
  export class EmailProcessor extends WorkerHost {
    constructor(private readonly mailer: MailerClient) { super(); }

    async process(job: Job<{ userId: number }>) {
      await job.updateProgress(10);
      await this.mailer.sendWelcome(job.data.userId); // may throw → retried
      await job.updateProgress(100);
    }
  }

  // app.module.ts
  BullModule.forRoot({ connection: { host: "localhost", port: 6379 } })
`

type Status = 'waiting' | 'active' | 'completed' | 'retrying'
interface Job { id: number, status: Status, progress: number, attempt: number }

const jobs = ref<Job[]>([])
let nextId = 1
const timers = new Set<ReturnType<typeof setTimeout>>()

function later(ms: number, fn: () => void) {
  const t = setTimeout(() => {
    timers.delete(t)
    fn()
  }, ms)
  timers.add(t)
}

function run(job: Job) {
  job.status = 'active'
  job.progress = 0
  const tick = () => {
    job.progress = Math.min(job.progress + 25, 100)
    // Roughly one in three first attempts fails, to show retries.
    if (job.progress === 50 && job.attempt === 1 && job.id % 3 === 0) {
      job.status = 'retrying'
      job.attempt++
      later(1200, () => run(job))
      return
    }
    if (job.progress >= 100)
      job.status = 'completed'
    else later(350, tick)
  }
  later(350, tick)
}

function enqueue() {
  jobs.value.unshift({ id: nextId++, status: 'waiting', progress: 0, attempt: 1 })
  const job = jobs.value[0]!
  if (jobs.value.length > 5)
    jobs.value.pop()
  later(600, () => run(job))
}

onBeforeUnmount(() => timers.forEach(clearTimeout))

const variant: Record<Status, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  waiting: 'outline',
  active: 'secondary',
  completed: 'default',
  retrying: 'destructive',
}
</script>

<template>
  <SlideLayout
    section="Events & Queues"
    title="Background jobs with BullMQ"
    subtitle="Respond now, do the slow and flaky work later — with retries — in a worker backed by Redis."
  >
    <div class="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <Tabs default-value="producer" class="min-w-0">
        <TabsList>
          <TabsTrigger value="producer">
            Producer
          </TabsTrigger>
          <TabsTrigger value="worker">
            Worker
          </TabsTrigger>
        </TabsList>
        <TabsContent value="producer">
          <CodeSnippet :code="producer" title="@nestjs/bullmq" size="sm" :highlight="[9, 10, 11, 12, 14]" />
        </TabsContent>
        <TabsContent value="worker">
          <CodeSnippet :code="worker" title="email.processor.ts" size="sm" :highlight="[1, 7]" />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Queue: email</CardTitle>
          <CardDescription>Simulated — click to add "welcome" jobs.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-3">
          <Button class="w-fit" @click="enqueue">
            <Plus data-icon="inline-start" />
            Enqueue job
          </Button>
          <template v-if="jobs.length">
            <div v-for="job in jobs" :key="job.id" class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between gap-2 text-sm">
                <span class="font-mono">welcome #{{ job.id }}</span>
                <span class="flex items-center gap-1.5">
                  <Badge v-if="job.attempt > 1" variant="outline">attempt {{ job.attempt }}</Badge>
                  <Badge :variant="variant[job.status]">{{ job.status }}</Badge>
                </span>
              </div>
              <Progress :model-value="job.progress" />
            </div>
          </template>
          <template v-else>
            <Skeleton v-for="n in 3" :key="n" class="h-8 w-full" />
          </template>
        </CardContent>
      </Card>
    </div>
  </SlideLayout>
</template>
