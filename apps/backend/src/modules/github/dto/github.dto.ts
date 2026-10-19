import { createZodDto } from "nestjs-zod";
import { z } from "zod/v4";

export const githubUserSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  avatar_url: z.url(),
  html_url: z.url(),
  public_repos: z.number().int(),
  followers: z.number().int(),
});

export type GithubUser = z.infer<typeof githubUserSchema>;

export class GithubUserDto extends createZodDto(githubUserSchema) {}
