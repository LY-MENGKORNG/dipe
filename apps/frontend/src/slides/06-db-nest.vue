<script lang="ts">
import type { SlideMeta } from '.'

export const meta: SlideMeta = {
  title: 'Wiring Prisma into Nest',
  section: 'Database & ORM',
  notes: [
    'Four small files, following the repo: create the client once, expose it through DI, give every repository access to it, and close it on shutdown.',
    'The PRISMA Symbol is the DI token. Using a Symbol instead of the class avoids collisions and makes it trivial to swap in a mock in tests.',
    'DBModule is @Global, so feature modules do not need to import it.',
    'Repositories keep Prisma out of services. Services stay testable: in a unit test we mock UserRepository, not Prisma.',
    'onApplicationShutdown + app.enableShutdownHooks() (already in main.ts) closes the pool cleanly — important in containers that send SIGTERM.',
  ],
}
</script>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CodeSnippet from '@/components/deck/CodeSnippet.vue'
import SlideLayout from '@/components/deck/SlideLayout.vue'

const tabs = [
  {
    value: 'client',
    label: '1 · client',
    title: 'src/config/db/index.ts',
    highlight: [5, 7],
    code: `
      import { PrismaPg } from "@prisma/adapter-pg";
      import { env } from "@repo/env";
      import { PrismaClient } from "./generated/client";

      const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

      export const db = new PrismaClient({ adapter });
      export type PrismaDB = typeof db;
    `,
  },
  {
    value: 'module',
    label: '2 · module',
    title: 'src/modules/db.module.ts',
    highlight: [1, 5, 6, 14, 15],
    code: `
      @Global()
      @Module({
        providers: [
          {
            provide: PRISMA,                 // Symbol("PRISMA")
            useFactory: () => db,
          },
        ],
        exports: [PRISMA],
      })
      export class DBModule {
        constructor(@Inject(PRISMA) private readonly db: PrismaDB) {}

        async onApplicationShutdown() {
          await safeTry(() => this.db.$disconnect());
        }
      }
    `,
  },
  {
    value: 'base',
    label: '3 · base repository',
    title: 'src/config/respository.config.ts',
    highlight: [3],
    code: `
      @Injectable()
      export abstract class InjectedRespository {
        constructor(@Inject(PRISMA) protected readonly db: PrismaDB) {}
      }
    `,
  },
  {
    value: 'repo',
    label: '4 · repository',
    title: 'src/modules/users/users.repository.ts',
    highlight: [3, 4, 5],
    code: `
      @Injectable()
      export class UserRepository extends InjectedRespository {
        findMany() {
          return this.db.user.findMany();
        }
      }

      // users.service.ts
      constructor(private readonly repository: UserRepository) {}
    `,
  },
]
</script>

<template>
  <SlideLayout
    section="Database & ORM"
    title="Wiring Prisma into Nest"
    subtitle="One client, one DI token, thin repositories. Services never import Prisma directly."
  >
    <Tabs default-value="client">
      <TabsList>
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
        <CodeSnippet :code="tab.code" :title="tab.title" :highlight="tab.highlight" />
      </TabsContent>
    </Tabs>
  </SlideLayout>
</template>
