import { z } from "zod/v4"

export const githubUserSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  avatar_url: z.url(),
  html_url: z.url(),
  public_repos: z.int().positive(),
  followers: z.int().positive(),
})

export const githubAuthResponseSchema = z.union([
  z.object({
    access_token: z.string(),
    token_type: z.string(),
    scope: z.string(),
    expires_in: z.number().positive().optional(),
    refresh_token: z.string().optional(),
    refresh_token_expires_in: z.number().positive().optional(),
  }),
  z.object({
    error: z.string(),
    error_description: z.string().optional(),
    error_uri: z.url().optional(),
  }),
])

/**
 *   "access_token":
 "expires_in": 28800,
 "refresh_token":
 "refresh_token_expires_in": 15724800,
 "token_type": "bearer",
 "scope": "read:user"
 */

export const githubProfileSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
})

export const githubEmailsSchema = z.array(
  z.object({
    email: z.email(),
    primary: z.boolean(),
    verified: z.boolean(),
  }),
)

export type GithubUser = z.infer<typeof githubUserSchema>
