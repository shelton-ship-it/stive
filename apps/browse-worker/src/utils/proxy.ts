import { logger } from "./logger.js";

const RESIDENTIAL_PROXY_POOL = [
  "http://res-proxy-01.internal:8080",
  "http://res-proxy-02.internal:8080",
  "http://res-proxy-03.internal:8080",
  "http://res-proxy-04.internal:8080",
  "http://res-proxy-05.internal:8080",
];

let proxyIndex = 0;
const domainLastAccessMap = new Map<string, number>();

export interface ProxyConfig {
  server: string;
  sessionId: string;
}

export function getRotatedProxy(sessionId?: string): ProxyConfig {
  const proxy = RESIDENTIAL_PROXY_POOL[proxyIndex % RESIDENTIAL_PROXY_POOL.length]!;
  proxyIndex++;

  const ephemeralSession = sessionId || `sess_${Math.random().toString(36).substring(2, 10)}`;

  logger.info("Proxy rotated for job session", {
    proxyServer: proxy,
    sessionId: ephemeralSession,
  });

  return {
    server: proxy,
    sessionId: ephemeralSession,
  };
}

export async function enforceDomainRateLimit(domain: string, minIntervalMs = 1000): Promise<void> {
  const lastAccess = domainLastAccessMap.get(domain) || 0;
  const now = Date.now();
  const elapsed = now - lastAccess;

  if (elapsed < minIntervalMs) {
    const waitTime = minIntervalMs - elapsed;
    logger.info("Enforcing domain rate limit delay", { domain, waitTimeMs: waitTime });
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  domainLastAccessMap.set(domain, Date.now());
}
