import { describe, expect, it } from "bun:test"
import { TransactionHost } from "@common/database"
import { db } from "@config/db"
import { UserRepository } from "@modules/users/users.repository"
import { useDatabase } from "./db"

describe("TransactionHost (integration)", () => {
  const t = useDatabase([UserRepository])

  it("rolls back every repository write when the callback throws", async () => {
    const transactions = t.get(TransactionHost)
    const users = t.get(UserRepository)
    const email = `rollback-${t.suffix}@dipe.dev`

    const error = await transactions
      .run(async () => {
        await users.create({ name: "Rollback", email, passwordHash: "x" })
        expect(await users.findByEmailWithSecret(email)).not.toBeNull()
        throw new Error("boom")
      })
      .catch((e: unknown) => e)

    expect((error as Error).message).toBe("boom")
    expect(await db.user.findUnique({ where: { email } })).toBeNull()
  })

  it("commits every repository write when the callback succeeds", async () => {
    const transactions = t.get(TransactionHost)
    const users = t.get(UserRepository)
    const email = `commit-${t.suffix}@dipe.dev`

    const created = await transactions.run(() =>
      users.create({ name: "Commit", email, passwordHash: "x" }),
    )
    t.userIds.push(created.id)

    expect(await db.user.findUnique({ where: { email } })).not.toBeNull()
  })
})
