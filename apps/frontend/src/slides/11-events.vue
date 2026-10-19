<script lang="ts">
import type { SlideMeta } from '.'

export const meta: SlideMeta = {
  title: 'Event-driven thinking',
  section: 'Events & Queues',
  notes: [
    'Problem: after creating a user we want to send a welcome email, write an audit log, and notify Slack. If UsersService calls all three, it knows too much and gets slow.',
    'Event-driven: UsersService just announces "user.created". Listeners decide what to do. Adding a fourth reaction touches zero existing code.',
    '@nestjs/event-emitter gives in-process events. Fast and simple — but they live in memory: if the process crashes, the event is gone, and there is no retry.',
    'That limitation is exactly why queues exist (next slide). Rule of thumb: in-process event for "nice to have, cheap", queue for "must happen eventually, may fail, may be slow".',
    'Emit AFTER the transaction commits; otherwise a listener may act on data that then rolls back.',
  ],
  ask: 'Which of these must not be lost if the server restarts: audit log, welcome email, cache invalidation?',
}
</script>

<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CodeSnippet from '@/components/deck/CodeSnippet.vue'
import SlideLayout from '@/components/deck/SlideLayout.vue'

const rows = [
  { aspect: 'Coupling', sync: 'Caller knows every step', event: 'Caller knows nothing', queue: 'Caller knows the queue' },
  { aspect: 'Survives a crash?', sync: 'n/a', event: 'No — in memory', queue: 'Yes — stored in Redis' },
  { aspect: 'Retries', sync: 'Manual', event: 'None', queue: 'Built-in, with backoff' },
  { aspect: 'Runs where?', sync: 'Same request', event: 'Same process', queue: 'Any worker process' },
  { aspect: 'Infra', sync: 'None', event: 'None', queue: 'Redis' },
]

const emit = `
  // users.service.ts
  async create(dto: CreateUserDto) {
    const user = await this.repository.create(dto, await hash(dto.password));
    this.events.emit("user.created", new UserCreatedEvent(user.id, user.email));
    return user;
  }
`

const listen = `
  // audit.listener.ts
  @Injectable()
  export class AuditListener {
    @OnEvent("user.created", { async: true })
    async handle(event: UserCreatedEvent) {
      await this.audit.log("user.created", event.userId);
    }
  }

  // app.module.ts
  imports: [EventEmitterModule.forRoot()]
`
</script>

<template>
  <SlideLayout
    section="Events & Queues"
    title="Event-driven thinking"
    subtitle="Announce what happened. Let others decide what to do about it."
  >
    <div class="grid gap-6 lg:grid-cols-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Direct call</TableHead>
            <TableHead>In-process event</TableHead>
            <TableHead>Queue (BullMQ)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in rows" :key="row.aspect">
            <TableCell class="font-medium">
              {{ row.aspect }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ row.sync }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ row.event }}
            </TableCell>
            <TableCell>{{ row.queue }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Tabs default-value="emit" class="min-w-0">
        <TabsList>
          <TabsTrigger value="emit">
            Emit
          </TabsTrigger>
          <TabsTrigger value="listen">
            Listen
          </TabsTrigger>
        </TabsList>
        <TabsContent value="emit">
          <CodeSnippet :code="emit" title="@nestjs/event-emitter" size="sm" :highlight="[4]" />
        </TabsContent>
        <TabsContent value="listen">
          <CodeSnippet :code="listen" title="@nestjs/event-emitter" size="sm" :highlight="[4, 11]" />
        </TabsContent>
      </Tabs>
    </div>
  </SlideLayout>
</template>
