import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"
import { UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { env } from "@repo/env"
import { Test } from "@nestjs/testing"
import { REDIS } from "@common/constants"
import { GithubClient } from "@modules/github/github.client"
import { EmailProducer } from "@modules/notifications/email.producer"
import { UserRepository } from "@modules/users/users.repository"
import { AuthService } from "@modules/auth/auth.service"

describe("AuthService", () => {
  let service: AuthService
  let passwordHash: string
  const repository = {
    findByEmailWithSecret: mock(),
    findById: mock(),
    create: mock(),
  }
  const jwt = { signAsync: mock().mockResolvedValue("signed.jwt.token") }
  const email = { sendLoggedInInfo: mock() }
  const github = {
    authorize: mock(),
    getProfile: mock(),
    getEmails: mock(),
  }
  const redis = { set: mock(), getdel: mock() }

  beforeAll(async () => {
    passwordHash = await Bun.password.hash("Password1")
  })

  beforeEach(async () => {
    for (const fn of [
      ...Object.values(repository),
      ...Object.values(github),
      ...Object.values(redis),
    ])
      fn.mockReset()
    jwt.signAsync.mockClear()

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: repository },
        { provide: JwtService, useValue: jwt },
        { provide: EmailProducer, useValue: email },
        { provide: GithubClient, useValue: github },
        { provide: REDIS, useValue: redis },
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

  describe("GitHub login", () => {
    const githubSuccess = () => {
      github.authorize.mockResolvedValue({
        access_token: "gho_token",
        token_type: "bearer",
        scope: "read:user,user:email",
      })
      github.getProfile.mockResolvedValue({ login: "octocat", name: null })
      github.getEmails.mockResolvedValue([
        { email: "old@github.dev", primary: false, verified: true },
        { email: "octo@github.dev", primary: true, verified: true },
      ])
    }

    it("stores a one-time code for an existing user", async () => {
      githubSuccess()
      repository.findByEmailWithSecret.mockResolvedValue({
        id: 7,
        isActive: true,
      })

      const code = await service.createGithubLoginCode("gh-code")

      expect(code).toMatch(/^[0-9a-f-]{36}$/)
      expect(github.getProfile).toHaveBeenCalledWith("gho_token")
      expect(repository.findByEmailWithSecret).toHaveBeenCalledWith(
        "octo@github.dev",
      )
      expect(repository.create).not.toHaveBeenCalled()
      expect(redis.set).toHaveBeenCalledWith(
        `auth:login-code:${code}`,
        7,
        "EX",
        60,
      )
    })

    it("creates a github user when the email is new", async () => {
      githubSuccess()
      repository.findByEmailWithSecret.mockResolvedValue(null)
      repository.create.mockResolvedValue({ id: 9, isActive: true })

      await service.createGithubLoginCode("gh-code")

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "octocat",
          email: "octo@github.dev",
          provider: "github",
        }),
      )
      expect(repository.create.mock.calls[0]![0]).toHaveProperty("passwordHash")
      expect(redis.set).toHaveBeenCalledWith(expect.any(String), 9, "EX", 60)
    })

    it("rejects a code GitHub refuses", async () => {
      github.authorize.mockResolvedValue({ error: "bad_verification_code" })

      const error = await service
        .createGithubLoginCode("stale")
        .catch((e: unknown) => e)

      expect(error).toBeInstanceOf(UnauthorizedException)
      expect((error as Error).message).toBe("bad_verification_code")
      expect(redis.set).not.toHaveBeenCalled()
    })

    it("rejects an account without a verified primary email", async () => {
      githubSuccess()
      github.getEmails.mockResolvedValue([
        { email: "octo@github.dev", primary: true, verified: false },
      ])

      const error = await service
        .createGithubLoginCode("gh-code")
        .catch((e: unknown) => e)

      expect((error as Error).message).toBe("no_verified_email")
      expect(repository.create).not.toHaveBeenCalled()
    })

    it("rejects a deactivated user", async () => {
      githubSuccess()
      repository.findByEmailWithSecret.mockResolvedValue({
        id: 7,
        isActive: false,
      })

      const error = await service
        .createGithubLoginCode("gh-code")
        .catch((e: unknown) => e)

      expect((error as Error).message).toBe("inactive_user")
      expect(redis.set).not.toHaveBeenCalled()
    })

    it("exchanges a stored code for a token once", async () => {
      redis.getdel.mockResolvedValue("7")
      repository.findById.mockResolvedValue({
        id: 7,
        email: "octo@github.dev",
        role: "EMPLOYEE",
        isActive: true,
      })

      const result = await service.exchangeLoginCode("some-code")

      expect(redis.getdel).toHaveBeenCalledWith("auth:login-code:some-code")
      expect(result.accessToken).toBe("signed.jwt.token")
      expect(jwt.signAsync).toHaveBeenCalledWith({
        sub: 7,
        email: "octo@github.dev",
        role: "EMPLOYEE",
      })
    })

    it("rejects an unknown or used code", async () => {
      redis.getdel.mockResolvedValue(null)

      const error = await service
        .exchangeLoginCode("used")
        .catch((e: unknown) => e)

      expect(error).toBeInstanceOf(UnauthorizedException)
      expect(jwt.signAsync).not.toHaveBeenCalled()
    })
  })
})
