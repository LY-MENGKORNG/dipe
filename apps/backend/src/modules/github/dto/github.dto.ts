import { createZodDto } from "nestjs-zod";
import { githubUserSchema } from "../github.schema";

export class GithubUserDto extends createZodDto(githubUserSchema) {}
