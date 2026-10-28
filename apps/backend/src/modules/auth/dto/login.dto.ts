import { createZodDto } from "nestjs-zod"
import {
  exchangeCodeSchema,
  githubCallbackSchema,
  loginSchema,
  tokenResponseSchema,
} from "../auth.schema"

export class LoginDto extends createZodDto(loginSchema) {}

export class ExchangeCodeDto extends createZodDto(exchangeCodeSchema) {}

export class TokenResponseDto extends createZodDto(tokenResponseSchema) {}

export class GithubCallbackDto extends createZodDto(githubCallbackSchema, {
  codec: true,
}) {}
