<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "Wiring Prisma into Nest",
  section: "Database & ORM",
  notes: [
    "Five small files: create the client once, expose it through DI, track the current transaction, give every repository a transaction-aware db, keep Prisma out of services.",
    "The PRISMA Symbol is the DI token. Using a Symbol instead of the class avoids collisions and makes it trivial to swap in a mock in tests.",
    "DBModule is @Global and uses useValue — the client already exists, no factory needed. onApplicationShutdown + enableShutdownHooks() closes the pool on SIGTERM.",
    'TransactionHost keeps the active transaction client in AsyncLocalStorage — think "a variable that follows the request through every await".',
    "BaseRepository.db returns that transaction when one is running, otherwise the global client. Repositories write normal Prisma code and automatically join a transaction their caller opened.",
    "Repositories keep Prisma out of services. Services stay testable: in a unit test we mock UserRepository, not Prisma.",
  ],
}
</script>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CodeSnippet from "@/components/deck/CodeSnippet.vue"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const tabs = [
  {
    value: "client",
    label: "1 · client",
    title: "src/config/db/index.ts",
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
    value: "module",
    label: "2 · module",
    title: "src/modules/db.module.ts",
    highlight: [3, 4, 9, 10],
    code: `
      @Global()
      @Module({
        providers: [{ provide: PRISMA, useValue: db }, TransactionHost],
        exports: [PRISMA, TransactionHost],
      })
      export class DBModule implements OnApplicationShutdown {
        constructor(@Inject(PRISMA) private readonly db: PrismaDB) {}

        async onApplicationShutdown() {
          await safeTry(() => this.db.$disconnect());
        }
      }
    `,
  },
  {
    value: "host",
    label: "3 · transaction host",
    title: "src/common/database/transaction.host.ts",
    highlight: [3, 8, 12, 13],
    code: `
      @Injectable()
      export class TransactionHost {
        private readonly storage = new AsyncLocalStorage<PrismaTx>();

        constructor(@Inject(PRISMA) private readonly prisma: PrismaDB) {}

        get client(): PrismaTx {
          return this.storage.getStore() ?? this.prisma; // tx inside run()
        }

        run<T>(fn: () => Promise<T>, options?: TransactionOptions) {
          if (this.isActive) return fn();                 // join the outer tx
          return this.prisma.$transaction((tx) => this.storage.run(tx, fn), options);
        }
      }
    `,
  },
  {
    value: "base",
    label: "4 · base repository",
    title: "src/common/database/base.repository.ts",
    highlight: [5, 6, 9, 10],
    code: `
      @Injectable()
      export abstract class BaseRepository {
        constructor(private readonly transactions: TransactionHost) {}

        protected get db(): PrismaTx {
          return this.transactions.client;
        }

        protected transaction<T>(fn: () => Promise<T>, options?: TransactionOptions) {
          return this.transactions.run(fn, options);
        }
      }
    `,
  },
  {
    value: "repo",
    label: "5 · repository",
    title: "src/modules/users/users.repository.ts",
    highlight: [2, 4, 8],
    code: `
      @Injectable()
      export class UserRepository extends BaseRepository {
        findById(id: number) {
          return this.db.user.findUnique({ where: { id }, select: publicUser });
        }

        create(data: Prisma.UserCreateInput) {
          return this.db.user.create({ data, select: publicUser });
        }
      }

      // users.service.ts — Prisma never leaks into services
      constructor(private readonly repository: UserRepository) {}
    `,
  },
]
</script>

<template>
  <SlideLayout
    section="Database & ORM"
    title="Wiring Prisma into Nest"
    subtitle="One client, one DI token, transaction-aware repositories. Services never import Prisma directly."
  >
    <Tabs default-value="client">
      <TabsList>
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
        <CodeSnippet
          :code="tab.code"
          :title="tab.title"
          :highlight="tab.highlight"
        />
      </TabsContent>
    </Tabs>
  </SlideLayout>
</template>
