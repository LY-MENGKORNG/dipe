import { describe, expect, it } from "bun:test"
import { UserRepository } from "@modules/users/users.repository"
import { useDatabase } from "./db"

describe("UserRepository (integration)", () => {
  const t = useDatabase([UserRepository])
  const email = () => `repo-${t.suffix}@dipe.dev`

  it("never returns the password hash from create()", async () => {
    const users = t.get(UserRepository)

    const created = await users.create({
      name: "Repo User",
      email: email(),
      passwordHash: "hash",
    })
    t.userIds.push(created.id)

    expect(created).toMatchObject({ email: email(), role: "EMPLOYEE" })
    expect(created).not.toHaveProperty("passwordHash")
  })

  it("only exposes the hash through findByEmailWithSecret()", async () => {
    const users = t.get(UserRepository)

    const [byId, withSecret] = await Promise.all([
      users.findById(t.userIds[0]),
      users.findByEmailWithSecret(email()),
    ])

    expect(byId).not.toHaveProperty("passwordHash")
    expect(withSecret?.passwordHash).toBe("hash")
  })

  it("lets Postgres reject a duplicate email", async () => {
    const users = t.get(UserRepository)

    const error = await users
      .create({ name: "Twin", email: email(), passwordHash: "hash" })
      .catch((e: unknown) => e)

    expect(error).toMatchObject({ code: "P2002" })
  })

  it("searches names and emails case-insensitively", async () => {
    const users = t.get(UserRepository)

    const page = await users.findMany({
      q: `REPO-${t.suffix}`,
      limit: 10,
      offset: 0,
    })

    expect(page.total).toBe(1)
    expect(page.data[0]).toMatchObject({ email: email() })
  })
})
