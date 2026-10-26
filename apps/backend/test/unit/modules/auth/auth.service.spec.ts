import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"
import { UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { env } from "@repo/env"
import { Test } from "@nestjs/testing"
import { EmailProducer } from "@modules/notifications/email.producer"
import { UserRepository } from "@modules/users/users.repository"
import { AuthService } from "@modules/auth/auth.service"

describe("AuthService", () => {
  let service: AuthService
  let passwordHash: string
  const repository = { findByEmailWithSecret: mock() }
  const jwt = { signAsync: mock().mockResolvedValue("signed.jwt.token") }
  const email = { sendLoggedInInfo: mock() }

  beforeAll(async () => {
    passwordHash = await Bun.password.hash("Password1")
  })

  beforeEach(async () => {
    repository.findByEmailWithSecret.mockReset()
    jwt.signAsync.mockClear()

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: repository },
        { provide: JwtService, useValue: jwt },
        { provide: EmailProducer, useValue: email },
      ],
    }).compile()

    service = module.get(AuthService)
  })

  it("issues a token for valid credentials", async () => {
    repository.findByEmailWithSecret.mockResolvedValue({
      id: 7,
      email: "a@dipe.dev",
      role: "ADMIN",
      isActive: true,
      passwordHash,
    })

    const result = await service.login({
      email: "a@dipe.dev",
      password: "Password1",
    })

    expect(result).toEqual({
      accessToken: "signed.jwt.token",
      tokenType: "Bearer",
      expiresIn: env.JWT_EXPIRES_IN,
    })
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: 7,
      email: "a@dipe.dev",
      role: "ADMIN",
    })
  })

  it("rejects a wrong password", async () => {
    repository.findByEmailWithSecret.mockResolvedValue({
      id: 7,
      isActive: true,
      passwordHash,
    })

    const error = await service
      .login({ email: "a@dipe.dev", password: "nope" })
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(UnauthorizedException)
    expect(jwt.signAsync).not.toHaveBeenCalled()
  })

  it("rejects an unknown email", async () => {
    repository.findByEmailWithSecret.mockResolvedValue(null)

    const error = await service
      .login({ email: "x@dipe.dev", password: "Password1" })
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(UnauthorizedException)
  })

  it("rejects a deactivated user", async () => {
    repository.findByEmailWithSecret.mockResolvedValue({
      id: 7,
      isActive: false,
      passwordHash,
    })

    const error = await service
      .login({ email: "a@dipe.dev", password: "Password1" })
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(UnauthorizedException)
  })
})
