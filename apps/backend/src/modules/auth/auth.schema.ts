import { z } from "zod/v4"

export const loginSchema = z
  .object({
    email: z.email().toLowerCase().describe("user's email"),
    password: z.string().min(1).max(128).describe("User's password"),
  })
  .describe("User login credentials")

export const tokenResponseSchema = z
  .object({
    accessToken: z.string(),
    tokenType: z.literal("Bearer"),
    expiresIn: z.string(),
  })
  .describe("The JSON response after successfully login")
