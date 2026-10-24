import { InjectQueue } from "@nestjs/bullmq"
import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import type { Job, Queue } from "bullmq"
import { Roles } from "@common/decorators"
import { EMAIL_QUEUE, type WelcomeEmailData } from "./email.queue"

// docs
@ApiTags("Jobs")
@ApiBearerAuth("bearer")
@ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
@ApiForbiddenResponse({ description: "Admin role required" })
// ---
@Roles(["admin"])
@Controller("jobs/email")
export class JobsController {
  private readonly logger = new Logger(JobsController.name)
  constructor(
    @InjectQueue(EMAIL_QUEUE) private readonly queue: Queue<WelcomeEmailData>,
  ) {}

  // docs
  @ApiOperation({ summary: "Email queue counts and the most recent jobs" })
  // ---
  @Get()
  async overview() {
    const [counts, jobs] = await Promise.all([
      this.queue.getJobCounts(
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
      ),
      this.queue.getJobs(
        ["waiting", "active", "completed", "failed", "delayed"],
        0,
        9,
        false,
      ),
    ])

    return {
      counts,
      recent: await Promise.all(jobs.map((job) => this.toView(job))),
    }
  }

  // docs
  @ApiOperation({ summary: "State of one email job" })
  @ApiNotFoundResponse({ description: "No job with this id" })
  // ---
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const job = await this.queue.getJob(id)
    if (!job) throw new NotFoundException(`Job #${id} not found`)
    return this.toView(job)
  }

  private async toView(job: Job<WelcomeEmailData>) {
    return {
      id: job.id,
      name: job.name,
      state: await job.getState(),
      data: job.data,
      progress: job.progress,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason || null,
      createdAt: new Date(job.timestamp).toISOString(),
      finishedAt: job.finishedOn
        ? new Date(job.finishedOn).toISOString()
        : null,
    }
  }
}
