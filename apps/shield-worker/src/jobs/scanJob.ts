import { Job } from "bullmq";
import { ShieldJobPayload } from "../index.js";
import { StrixEngine } from "../engines/StrixEngine.js";
import { logger } from "../utils/logger.js";

export async function processScanJob(job: Job<ShieldJobPayload>) {
  const { targetRepoOrUrl, scanType = "dast" } = job.data;

  logger.info("Executing Shield security scan job", {
    jobId: job.id,
    target: targetRepoOrUrl,
    scanType,
  });

  const engine = new StrixEngine({
    target: targetRepoOrUrl,
    scanType,
  });

  const result = await engine.runScan();

  logger.info("Security scan execution complete", {
    jobId: job.id,
    scanId: result.scanId,
    findingCount: result.findings.length,
  });

  return result;
}
