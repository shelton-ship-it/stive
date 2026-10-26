import { Job } from "bullmq";
import { BrowseJobPayload } from "../index.js";
import { getRotatedProxy, enforceDomainRateLimit } from "../utils/proxy.js";
import { CamofoxEngine } from "../engines/CamofoxEngine.js";
import { logger } from "../utils/logger.js";

// In-memory / Redis idempotency cache for deduplication
const processedIdempotencyKeys = new Set<string>();

export async function processBrowseJob(job: Job<BrowseJobPayload>) {
  const { url, actions, sessionId, domainRateLimitMs, idempotencyKey } = job.data;

  // Idempotency check: prevent duplicate work execution
  const effectiveIdempotencyKey = idempotencyKey || job.id || `${url}-${sessionId}`;
  if (processedIdempotencyKeys.has(effectiveIdempotencyKey) && job.attemptsMade === 0) {
    logger.warn("Duplicate job execution skipped due to idempotency key match", {
      idempotencyKey: effectiveIdempotencyKey,
      jobId: job.id,
    });
    return {
      success: true,
      idempotencySkipped: true,
      url,
      message: "Job execution skipped: idempotency key already processed",
    };
  }

  // Extract domain for rate limiting
  const parsedUrl = new URL(url);
  await enforceDomainRateLimit(parsedUrl.hostname, domainRateLimitMs || 1000);

  // Get ephemeral proxy for this job
  const proxy = getRotatedProxy(sessionId);

  logger.info("Starting browse job execution", {
    jobId: job.id,
    idempotencyKey: effectiveIdempotencyKey,
    url,
    sessionId: proxy.sessionId,
  });

  const engine = new CamofoxEngine({
    proxy,
    headless: true,
    fingerprintRandomization: true,
  });

  try {
    await engine.initializeSession();
    const result = await engine.executeBrowse(url, actions);
    await engine.closeSession();

    // Mark idempotency key as processed
    processedIdempotencyKeys.add(effectiveIdempotencyKey);

    return result;
  } catch (error) {
    await engine.closeSession();
    throw error;
  }
}
