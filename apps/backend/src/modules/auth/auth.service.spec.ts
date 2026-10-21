import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";
import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { UserRepository } from "@modules/users/users.repository";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;
  let passwordHash: string;
  const repository = { findByEmailWithSecret: mock() };
  const jwt = { signAsync: mock().mockResolvedValue("signed.jwt.token") };

  beforeAll(async () => {
    passwordHash = await Bun.password.hash("Password1");
  });

  beforeEach(async () => {
    repository.findByEmailWithSecret.mockReset();
    jwt.signAsync.mockClear();

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: repository },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: { get: () => "1h" } },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it("issues a token for valid credentials", async () => {
    repository.findByEmailWithSecret.mockResolvedValue({
      id: 7,
      email: "a@dipe.dev",
      role: "admin",
      isActive: true,
      passwordHash,
    });

    const result = await service.login({ email: "a@dipe.dev", password: "Password1" });

    expect(result).toEqual({
      accessToken: "signed.jwt.token",
      tokenType: "Bearer",
      expiresIn: "1h",
    });
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 7, email: "a@dipe.dev", role: "admin" });
  });

  it("rejects a wrong password", async () => {
    repository.findByEmailWithSecret.mockResolvedValue({ id: 7, isActive: true, passwordHash });

    const error = await service
      .login({ email: "a@dipe.dev", password: "nope" })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it("rejects an unknown email", async () => {
    repository.findByEmailWithSecret.mockResolvedValue(null);

    const error = await service
      .login({ email: "x@dipe.dev", password: "Password1" })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UnauthorizedException);
  });

  it("rejects a deactivated user", async () => {
    repository.findByEmailWithSecret.mockResolvedValue({ id: 7, isActive: false, passwordHash });

    const error = await service
      .login({ email: "a@dipe.dev", password: "Password1" })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UnauthorizedException);
  });
});
