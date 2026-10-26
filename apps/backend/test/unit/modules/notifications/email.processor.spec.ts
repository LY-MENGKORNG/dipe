import { beforeEach, describe, expect, it, mock } from "bun:test"
import type { MailerService } from "@nestjs-modules/mailer"
import type { ConfigService } from "@nestjs/config"
import type { Job } from "bullmq"
import type { Env } from "@repo/env"
import { EmailProcessor } from "@modules/notifications/email.processor"
import {
  EmailJob,
  type WelcomeEmailData,
} from "@modules/notifications/email.queue"

const jobOf = (name: string) =>
  ({
    name,
    data: { userId: 1, email: "dara@dipe.dev", name: "Dara" },
    updateProgress: mock(),
  }) as unknown as Job<WelcomeEmailData> & {
    updateProgress: ReturnType<typeof mock>
  }

const configWith = (failureRate: number) =>
  ({ get: () => failureRate }) as unknown as ConfigService<Env, true>

describe("EmailProcessor", () => {
  const mailer = { sendMail: mock() }
  let processor: EmailProcessor

  beforeEach(() => {
    mailer.sendMail.mockReset()
    processor = new EmailProcessor(
      mailer as unknown as MailerService,
      configWith(0),
    )
  })

  it("sends the welcome email to the job's user and reports progress", async () => {
    const job = jobOf(EmailJob.Welcome)

    const result = await processor.process(job)

    expect(mailer.sendMail).toHaveBeenCalledWith({
      to: "dara@dipe.dev",
      subject: "Welcome to DIPE",
      template: "welcome",
      context: { name: "Dara", email: "dara@dipe.dev" },
    })
    expect(job.updateProgress.mock.calls).toEqual([[10], [100]])
    expect(result.deliveredAt).toBeString()
  })

  it("lets mailer failures bubble up so BullMQ retries the job", async () => {
    mailer.sendMail.mockRejectedValue(new Error("SMTP down"))

    const error = await processor
      .process(jobOf(EmailJob.Welcome))
      .catch((e: unknown) => e)

    expect((error as Error).message).toBe("SMTP down")
  })

  it("simulates failures when MAILER_FAILURE_RATE is 1", async () => {
    processor = new EmailProcessor(
      mailer as unknown as MailerService,
      configWith(1),
    )

    const error = await processor
      .process(jobOf(EmailJob.Welcome))
      .catch((e: unknown) => e)

    expect((error as Error).message).toContain("MAILER_FAILURE_RATE")
    expect(mailer.sendMail).not.toHaveBeenCalled()
  })

  it("rejects unknown job names", async () => {
    const error = await processor
      .process(jobOf("nope"))
      .catch((e: unknown) => e)

    expect((error as Error).message).toContain("Unknown job")
  })
})
