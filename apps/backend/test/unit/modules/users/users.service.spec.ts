import { beforeEach, describe, expect, it, mock } from "bun:test"
import { NotFoundException } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { EmailProducer } from "@modules/notifications/email.producer"
import { UserRepository } from "@modules/users/users.repository"
import { UsersService } from "@modules/users/users.service"

const user = {
  id: 1,
  name: "Dara",
  email: "dara@dipe.dev",
  role: "EMPLOYEE" as const,
  language: "EN" as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe("UsersService", () => {
  let service: UsersService
  const repository = { findById: mock(), create: mock(), update: mock() }
  const email = { sendWelcome: mock() }

  beforeEach(async () => {
    Object.values(repository).forEach((fn) => fn.mockReset())
    email.sendWelcome.mockReset()

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: repository },
        { provide: EmailProducer, useValue: email },
      ],
    }).compile()

    service = module.get(UsersService)
  })

  it("returns the user when it exists", async () => {
    repository.findById.mockResolvedValue(user)

    const found = await service.findOne(1)

    expect(found).toEqual(user)
    expect(repository.findById).toHaveBeenCalledWith(1)
  })

  it("throws NotFoundException when the user is missing", async () => {
    repository.findById.mockResolvedValue(null)

    const error = await service.findOne(99).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(NotFoundException)
  })

  it("hashes the password and never stores it in plain text", async () => {
    repository.create.mockResolvedValue(user)

    await service.create({
      name: "Dara",
      email: "dara@dipe.dev",
      password: "Password1",
      role: "EMPLOYEE",
      isActive: true,
    })

    const [data] = repository.create.mock.calls[0] as [Record<string, unknown>]
    expect(data).not.toHaveProperty("password")
    expect(data.passwordHash).toStartWith("$argon2id$")
    expect(
      await Bun.password.verify("Password1", data.passwordHash as string),
    ).toBeTrue()
  })

  it("enqueues a welcome email after creating the user", async () => {
    repository.create.mockResolvedValue(user)

    await service.create({
      name: "Dara",
      email: "dara@dipe.dev",
      password: "Password1",
      role: "EMPLOYEE",
      isActive: true,
    })

    expect(email.sendWelcome).toHaveBeenCalledWith({
      userId: 1,
      email: "dara@dipe.dev",
      name: "Dara",
    })
  })

  it("only rehashes when a new password is sent", async () => {
    repository.update.mockResolvedValue(user)

    await service.update(1, { name: "Dara K" })

    expect(repository.update).toHaveBeenCalledWith(1, { name: "Dara K" })
  })
})
