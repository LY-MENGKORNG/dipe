import { createZodDto } from "nestjs-zod"
import { updateUserSchema } from "@repo/schema"

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
