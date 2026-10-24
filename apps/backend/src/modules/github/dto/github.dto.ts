import { createZodDto } from "nestjs-zod"
import { githubUserSchema } from "../schema/github.schema"

export class GithubUserDto extends createZodDto(githubUserSchema) {}
