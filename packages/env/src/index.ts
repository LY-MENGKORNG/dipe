import { z } from "zod/v4"

export const envSchema = z
  .object({
    /** Nodejs runime environment 🚜 */
    NODE_ENV: z
      .enum(["development", "test", "testing", "production"])
      .default("development")
      .readonly(),

    /** The running port 🚪 */
    PORT: z.string().pipe(z.coerce.number()),

    /** Observability App key 🔍 */
    OBSERVE_APP_KEY: z.string().readonly(),
    /** Observability Secret 🔍 */
    OBSERVE_APP_SECRET: z.string().readonly(),

    /** Database connection string 🔌 */
    DATABASE_URL: z.string().readonly(),

    /** Access-Control-Allow-Origins */
    ALLOW_ORIGINS: z
      .string()
      .transform((v) => v.split(",").map((item) => item.trim()))
      .pipe(z.array(z.string())),

    JWT_SECRET: z.string().min(32).readonly(),
    JWT_EXPIRES_IN: z.string().default("1h").readonly(),

    GITHUB_TOKEN: z.string().optional().readonly(),

    REDIS_URL: z.string().default("redis://localhost:6379").readonly(),
    MAILER_FAILURE_RATE: z.coerce.number().min(0).max(1).default(0).readonly(),

    SMTP_HOST: z.string().default("localhost").readonly(),
    SMTP_PORT: z.coerce.number().int().default(1025).readonly(),
    SMTP_USER: z.string().optional().readonly(),
    SMTP_PASS: z.string().optional().readonly(),
    MAIL_FROM: z.string().default('"DIPE" <noreply@dipe.dev>').readonly(),

    /** GitHub Client ID 🔍 */
    GITHUB_CLIENT_ID: z.string().optional().readonly(),
    /** GitHub Client Secret 🔍 */
    GITHUB_CLIENT_SECRET: z.string().optional().readonly(),
  })
  .loose()

export type Env = z.infer<typeof envSchema>

/**
 * The type-safe loaded env ⚙️
 */
export const env: Readonly<Env> = envSchema.parse(Bun.env)
