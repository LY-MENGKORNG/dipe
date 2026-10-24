import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { MailerService } from "@nestjs-modules/mailer"
import type { Job } from "bullmq"
import type { Env } from "@repo/env"
import { EMAIL_QUEUE, EmailJob, type WelcomeEmailData } from "./email.queue"

@Processor(EMAIL_QUEUE, { concurrency: 5 })
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name)

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService<Env, true>,
  ) {
    super()
  }

  override async process(job: Job<WelcomeEmailData>) {
    if (job.name === EmailJob.Welcome) {
      await job.updateProgress(10)

      if (
        Math.random() < this.config.get("MAILER_FAILURE_RATE", { infer: true })
      ) {
        throw new Error("Simulated SMTP failure (MAILER_FAILURE_RATE)")
      }

      await this.mailer.sendMail({
        to: job.data.email,
        subject: "Welcome to DIPE",
        template: "welcome",
        context: { name: job.data.name, email: job.data.email },
      })

      await job.updateProgress(100)
      return { deliveredAt: new Date().toISOString() }
    }
    if (job.name === EmailJob.Login) {
      await job.updateProgress(10)

      if (
        Math.random() < this.config.get("MAILER_FAILURE_RATE", { infer: true })
      ) {
        throw new Error("Simulated SMTP failure (MAILER_FAILURE_RATE)")
      }

      await this.mailer.sendMail({
        to: job.data.email,
        subject: "Login information",
        template: "login-info",
        context: { name: job.data.name, email: job.data.email },
      })
      return { deliveredAt: new Date().toISOString() }
    }

    throw new Error(`Unknown job "${job.name}"`)
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<WelcomeEmailData>, error: Error) {
    this.logger.warn(
      `Job ${job.name}#${job.id} failed (attempt ${job.attemptsMade}/${job.opts.attempts}): ${error.message}`,
    )
  }
}
