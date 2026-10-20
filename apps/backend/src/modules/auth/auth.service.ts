import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Env } from "@repo/env";
import type { AuthUser } from "@common/types/auth";
import { UserRepository } from "@modules/users/users.repository";
import type { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.users.findByEmailWithSecret(email);
    const valid = user ? await Bun.password.verify(password, user.passwordHash) : false;

    if (!user || !valid || !user.isActive) throw new UnauthorizedException("Invalid credentials");

    const payload: AuthUser = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: "Bearer" as const,
      expiresIn: this.config.get("JWT_EXPIRES_IN", { infer: true }),
    };
  }
}
