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

export const SHIELD_QUEUE_NAME = "stive-shield-queue";

export const shieldQueue = new Queue(SHIELD_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: { age: 86400, count: 1000 },
    removeOnFail: { age: 604800, count: 5000 },
  },
});

logger.info("Shield Worker Queue initialized", {
  queue: SHIELD_QUEUE_NAME,
  redisHost,
});
