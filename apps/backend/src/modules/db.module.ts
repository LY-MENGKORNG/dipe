import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from "@nestjs/common"
import { PRISMA } from "@common/constants"
import { TransactionHost } from "@common/database"
import { db, type PrismaDB } from "@config/db"
import { safeTry } from "@repo/utils/exception"

@Global()
@Module({
  providers: [{ provide: PRISMA, useValue: db }, TransactionHost],
  exports: [PRISMA, TransactionHost],
})
export class DBModule implements OnApplicationShutdown {
  constructor(@Inject(PRISMA) private readonly db: PrismaDB) { }

  async onApplicationShutdown() {
    await safeTry(() => this.db.$disconnect())
  }
}
