import { z } from "zod/v4"

export const loginSchema = z
  .object({
    email: z.email().toLowerCase().describe("user's email"),
    password: z.string().min(1).max(128).describe("User's password"),
  })
  .describe("User login credentials")

export const exchangeCodeSchema = z
  .object({
    code: z.uuid().describe("One-time code from the GitHub login redirect"),
  })
  .describe("One-time login code exchange")

export const tokenResponseSchema = z
  .object({
    accessToken: z.string(),
    tokenType: z.literal("Bearer"),
    expiresIn: z.string(),
  })
  .describe("The JSON response after successfully login")

export const githubCallbackSchema = z.object({
  code: z.string().optional().describe("GitHub OAuth code"),
})
