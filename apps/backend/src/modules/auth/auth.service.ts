import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import type { Redis } from "ioredis"
import { env } from "@repo/env"
import { REDIS } from "@common/constants"
import type { AuthUser } from "@common/types/auth"
import { GithubClient } from "@modules/github/github.client"
import { UserRepository } from "@modules/users/users.repository"
import type { LoginDto } from "./dto/login.dto"
import { EmailProducer } from "@modules/notifications/email.producer"

const LOGIN_CODE_TTL_SECONDS = 60

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly users: UserRepository,
    private readonly jwt: JwtService,
    private readonly email: EmailProducer,
    private readonly github: GithubClient,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.users.findByEmailWithSecret(email)
    const valid = user
      ? await Bun.password.verify(password, user.passwordHash)
      : false

    if (!user || !valid || !user.isActive)
      throw new UnauthorizedException("Invalid credentials")

    await this.email.sendLoggedInInfo({
      name: user.name,
      email: user.email,
      userId: user.id,
    })

    return this.issueToken(user)
  }

  async createGithubLoginCode(githubCode: string) {
    const auth = await this.github.authorize(githubCode)
    if ("error" in auth) {
      this.logger.error(auth.error)
      throw new UnauthorizedException(auth.error)
    }

    const [profile, emails] = await Promise.all([
      this.github.getProfile(auth.access_token),
      this.github.getEmails(auth.access_token),
    ])

    const email = emails.find((e) => e.primary && e.verified)?.email
    if (!email) throw new UnauthorizedException("no_verified_email")

    const user =
      (await this.users.findByEmailWithSecret(email)) ??
      (await this.users.create({
        name: profile.name ?? profile.login,
        email,
        provider: "github",
        passwordHash: await Bun.password.hash(crypto.randomUUID()),
      }))

    if (!user.isActive) throw new UnauthorizedException("inactive_user")

    const code = crypto.randomUUID()
    await this.redis.set(
      `auth:login-code:${code}`,
      user.id,
      "EX",
      LOGIN_CODE_TTL_SECONDS,
    )
    return code
  }

  async exchangeLoginCode(code: string) {
    const userId = await this.redis.getdel(`auth:login-code:${code}`)
    const user = userId ? await this.users.findById(Number(userId)) : null

    if (!user?.isActive)
      throw new UnauthorizedException("Invalid or expired code")

    return this.issueToken(user)
  }

  private async issueToken({
    id,
    email,
    role,
  }: {
    id: number
    email: string
    role: AuthUser["role"]
  }) {
    const payload: AuthUser = { sub: id, email, role }

    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: "Bearer" as const,
      expiresIn: env.JWT_EXPIRES_IN,
    }
  }
}
