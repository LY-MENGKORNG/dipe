import { AsyncLocalStorage } from "node:async_hooks";
import { Inject, Injectable } from "@nestjs/common";
import { PRISMA } from "@common/constants";
import { type PrismaDB } from "@config/db";
import type { Prisma } from "@config/db/generated/client";

export type PrismaTx = Prisma.TransactionClient;

export interface TransactionOptions {
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

@Injectable()
export class TransactionHost {
  private readonly storage = new AsyncLocalStorage<PrismaTx>();

  constructor(@Inject(PRISMA) private readonly prisma: PrismaDB) {}

  get client(): PrismaTx {
    return this.storage.getStore() ?? this.prisma;
  }

  get isActive() {
    return this.storage.getStore() !== undefined;
  }

  run<T>(fn: () => Promise<T>, options?: TransactionOptions): Promise<T> {
    if (this.isActive) return fn();

    return this.prisma.$transaction((tx) => this.storage.run(tx, fn), options);
  }
}
