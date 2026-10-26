import { describe, expect, it, mock } from "bun:test"
import type { PrismaDB } from "@config/db"
import { TransactionHost } from "@common/database/transaction.host"

const fakePrisma = () => {
  const tx = { name: "tx" }
  const prisma = {
    name: "prisma",
    $transaction: mock((fn: (client: unknown) => Promise<unknown>) => fn(tx)),
  }
  return {
    prisma,
    tx,
    host: new TransactionHost(prisma as unknown as PrismaDB),
  }
}

describe("TransactionHost", () => {
  it("uses the global client outside a transaction", () => {
    const { host, prisma } = fakePrisma()

    expect(host.client as unknown).toBe(prisma)
    expect(host.isActive).toBeFalse()
  })

  it("hands the transaction client to everything inside run()", async () => {
    const { host, tx } = fakePrisma()

    const seen = await host.run(async () => {
      await Bun.sleep(1)
      return host.client
    })

    expect(seen as unknown).toBe(tx)
  })

  it("joins an outer transaction instead of opening a nested one", async () => {
    const { host, prisma } = fakePrisma()

    await host.run(() =>
      host.run(() => host.run(() => Promise.resolve(host.isActive))),
    )

    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
  })

  it("goes back to the global client after run() settles", async () => {
    const { host, prisma } = fakePrisma()

    await host.run(() => Promise.resolve("done"))

    expect(host.client as unknown).toBe(prisma)
  })
})
