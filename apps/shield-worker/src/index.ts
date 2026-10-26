import { Worker, Job } from "bullmq";
import { redisConnection, SHIELD_QUEUE_NAME } from "./queue.js";
import { processScanJob } from "./jobs/scanJob.js";
import { processReportJob } from "./jobs/reportJob.js";
import { logger } from "./utils/logger.js";

export interface ShieldJobPayload {
  type: "scan" | "report";
  targetRepoOrUrl: string;
  scanType?: "dast" | "container" | "dependencies" | "sast";
  reportFormat?: "sarif" | "json";
  scanId?: string;
}

logger.info("Starting Stive Shield Security Worker process (CI / Private Network only)...");

export const shieldWorker = new Worker<ShieldJobPayload>(
  SHIELD_QUEUE_NAME,
  async (job: Job<ShieldJobPayload>) => {
    logger.info("Processing security scan job", {
      jobId: job.id,
      type: job.data.type,
      target: job.data.targetRepoOrUrl,
      attempt: job.attemptsMade + 1,
    });

    if (job.data.type === "scan") {
      return await processScanJob(job);
    } else if (job.data.type === "report") {
      return await processReportJob(job);
    } else {
      throw new Error(`Unknown shield worker job type: ${job.data.type}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

shieldWorker.on("completed", (job) => {
  logger.info("Shield security job completed", { jobId: job.id, type: job.data.type });
});

shieldWorker.on("failed", (job, err) => {
  logger.error("Shield security job execution failed", {
    jobId: job?.id,
    type: job?.data.type,
    error: err.message,
  });
});

process.on("SIGINT", async () => {
  logger.info("Shutting down Shield Worker gracefully...");
  await shieldWorker.close();
  process.exit(0);
});
