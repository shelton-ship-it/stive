import { Job } from "bullmq";
import { ShieldJobPayload } from "../index.js";
import { StrixEngine } from "../engines/StrixEngine.js";
import { logger } from "../utils/logger.js";

export async function processReportJob(job: Job<ShieldJobPayload>) {
  const { targetRepoOrUrl, scanType = "dast", reportFormat = "sarif" } = job.data;

  logger.info("Executing Shield security report generation job", {
    jobId: job.id,
    target: targetRepoOrUrl,
    reportFormat,
  });

  const engine = new StrixEngine({
    target: targetRepoOrUrl,
    scanType,
  });

  const scanResult = await engine.runScan();

  if (reportFormat === "sarif") {
    const sarifReport = await engine.generateSarifReport(scanResult);
    return {
      format: "sarif",
      content: sarifReport,
    };
  }

  return {
    format: "json",
    content: scanResult,
  };
}
