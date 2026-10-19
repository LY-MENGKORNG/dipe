import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { EmailProcessor } from "./email.processor";
import { EmailProducer } from "./email.producer";
import { EMAIL_QUEUE } from "./email.queue";
import { JobsController } from "./jobs.controller";

@Module({
  imports: [BullModule.registerQueue({ name: EMAIL_QUEUE })],
  controllers: [JobsController],
  providers: [EmailProducer, EmailProcessor],
  exports: [EmailProducer],
})
export class NotificationsModule {}
