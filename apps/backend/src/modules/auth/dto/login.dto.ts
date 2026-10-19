import { z } from "zod/v4";
import { createZodDto } from "nestjs-zod";

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1).max(128),
});

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal("Bearer"),
  expiresIn: z.string(),
});

export class LoginDto extends createZodDto(loginSchema) {}

export class TokenResponseDto extends createZodDto(tokenResponseSchema) {}
