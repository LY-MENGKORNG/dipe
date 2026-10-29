import { createZodDto } from "nestjs-zod"
import { createUserSchema } from "@repo/schema"

export class CreateUserDto extends createZodDto(createUserSchema) {}
