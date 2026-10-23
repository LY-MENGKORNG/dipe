import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import { EMAIL_QUEUE, EmailJob, type WelcomeEmailData } from "./email.queue";
import { isError, safeTry } from "@repo/utils";

@Injectable()
export class EmailProducer {
  private readonly logger = new Logger(EmailProducer.name);

  constructor(@InjectQueue(EMAIL_QUEUE) private readonly queue: Queue<WelcomeEmailData>) {}

  async sendWelcome(data: WelcomeEmailData) {
    const result = await safeTry(
      this.queue.add(EmailJob.Welcome, data, {
        attempts: 5,
        backoff: { type: "exponential", delay: 1_000 },
        removeOnComplete: { age: 3_600, count: 1_000 },
        removeOnFail: { age: 24 * 3_600 },
      }),
    );

    if (isError(result)) {
      this.logger.error(`Could not enqueue welcome email for user #${data.userId}`, result);
      return null;
    }
    this.logger.debug(`Enqueued welcome email for user #${data.userId}`);
    return result;
  }

  async sendLoggedInInfo(data: WelcomeEmailData) {
    const result = await safeTry(
      this.queue.add(EmailJob.Login, data, {
        attempts: 5,
        backoff: { type: "exponential", delay: 1_000 },
        removeOnComplete: { age: 3_600, count: 1_000 },
        removeOnFail: { age: 24 * 3_600 },
      }),
    );

    if (isError(result)) {
      this.logger.error(`Could not enqueue welcome email for user #${data.userId}`, result);
      return null;
    }
    this.logger.debug(`Enqueued welcome email for user #${data.userId}`);
    return result;
  }
}
