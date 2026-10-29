import { createZodDto } from "nestjs-zod"
import { githubUserSchema } from "@repo/schema"

export class GithubUserDto extends createZodDto(githubUserSchema) {}
