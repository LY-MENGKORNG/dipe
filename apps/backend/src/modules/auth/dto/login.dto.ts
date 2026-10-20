import { createZodDto } from "nestjs-zod";
import { loginSchema, tokenResponseSchema } from "../auth.schema";

export class LoginDto extends createZodDto(loginSchema) {}

export class TokenResponseDto extends createZodDto(tokenResponseSchema) {}
