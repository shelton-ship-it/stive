import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { logger } from "./utils/logger.js";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export const redisConnection = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const BROWSE_QUEUE_NAME = "stive-browse-queue";
export const BROWSE_DLQ_NAME = "stive-browse-dlq";

export const browseQueue = new Queue(BROWSE_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86400, count: 5000 },
  },
});

export const browseDLQ = new Queue(BROWSE_DLQ_NAME, {
  connection: redisConnection,
});

logger.info("Browse Worker Queue initialized", {
  queue: BROWSE_QUEUE_NAME,
  dlq: BROWSE_DLQ_NAME,
  redisHost,
});
