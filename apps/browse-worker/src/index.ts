import { Worker, Job } from "bullmq";
import { redisConnection, BROWSE_QUEUE_NAME, browseDLQ } from "./queue.js";
import { processBrowseJob } from "./jobs/browseJob.js";
import { processScrapeJob } from "./jobs/scrapeJob.js";
import { logger } from "./utils/logger.js";

export interface BrowseJobPayload {
  type: "browse" | "scrape";
  url: string;
  sessionId?: string;
  idempotencyKey?: string;
  actions?: Array<{ action: string; selector?: string; value?: string }>;
  domainRateLimitMs?: number;
}

logger.info("Starting Stive Browse Worker process (No public ports exposed)...");

export const browseWorker = new Worker<BrowseJobPayload>(
  BROWSE_QUEUE_NAME,
  async (job: Job<BrowseJobPayload>) => {
    logger.info("Processing job started", {
      jobId: job.id,
      type: job.data.type,
      url: job.data.url,
      attempt: job.attemptsMade + 1,
    });

    if (job.data.type === "browse") {
      return await processBrowseJob(job);
    } else if (job.data.type === "scrape") {
      return await processScrapeJob(job);
    } else {
      throw new Error(`Unknown browse worker job type: ${job.data.type}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

browseWorker.on("completed", (job) => {
  logger.info("Job completed successfully", { jobId: job.id, type: job.data.type });
});

// DLQ requirement: failed jobs after max retries are moved to a separate dead-letter queue via 'failed' listener
browseWorker.on("failed", async (job, err) => {
  logger.error("Job execution failed", {
    jobId: job?.id,
    type: job?.data.type,
    attemptsMade: job?.attemptsMade,
    error: err.message,
  });

  if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
    logger.warn("Max retries reached. Moving job to Dead Letter Queue (DLQ)...", {
      jobId: job.id,
      queue: BROWSE_QUEUE_NAME,
    });

    await browseDLQ.add("dead-letter-job", {
      originalJobId: job.id,
      data: job.data,
      failedReason: err.message,
      failedAt: new Date().toISOString(),
    });
  }
});

process.on("SIGINT", async () => {
  logger.info("Shutting down Browse Worker gracefully...");
  await browseWorker.close();
  process.exit(0);
});
