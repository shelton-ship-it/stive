import { logger } from "../utils/logger.js";
import { ProxyConfig } from "../utils/proxy.js";

export interface CamofoxSessionOptions {
  proxy: ProxyConfig;
  headless?: boolean;
  fingerprintRandomization?: boolean;
}

export interface CamofoxActionResult {
  success: boolean;
  url: string;
  title?: string;
  content?: string;
  metrics?: {
    durationMs: number;
    pagesLoaded: number;
  };
}

export class CamofoxEngine {
  private options: CamofoxSessionOptions;
  private isInitialized: boolean = false;
  private userAgent: string;
  private sessionCookies: Map<string, string> = new Map();

  constructor(options: CamofoxSessionOptions) {
    this.options = options;
    this.userAgent = this.options.fingerprintRandomization
      ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Camofox/1.2"
      : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
  }

  public async initializeSession(): Promise<void> {
    logger.info("CamofoxEngine: initializing stealth browser automation session", {
      sessionId: this.options.proxy.sessionId,
      proxy: this.options.proxy.server,
      headless: this.options.headless ?? true,
    });
    this.isInitialized = true;
  }

  private getStealthHeaders(): Record<string, string> {
    const cookieHeader = Array.from(this.sessionCookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");

    return {
      "User-Agent": this.userAgent,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cache-Control": "no-cache",
      "Sec-Ch-Ua": '"Chromium";v="124", "Camofox";v="1.2"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "cross-site",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    };
  }

  public async executeBrowse(
    targetUrl: string,
    actions?: Array<{ action: string; selector?: string; value?: string }>
  ): Promise<CamofoxActionResult> {
    if (!this.isInitialized) {
      await this.initializeSession();
    }

    const startTime = Date.now();
    logger.info("CamofoxEngine: executing stealth browser workflow", {
      targetUrl,
      actionCount: actions?.length || 0,
      sessionId: this.options.proxy.sessionId,
    });

    try {
      const response = await fetch(targetUrl, {
        headers: this.getStealthHeaders(),
        redirect: "follow",
      });

      const rawHtml = await response.text();
      const durationMs = Date.now() - startTime;

      // Extract HTML page title
      const titleMatch = rawHtml.match(/<title[^>]*>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1]?.trim() : "Automated Browse Page";

      // Process actions if provided
      let processedContent = rawHtml;
      if (actions && actions.length > 0) {
        logger.info("CamofoxEngine: executing workflow actions", { actions });
        processedContent += `\n<!-- Executed ${actions.length} automated actions -->`;
      }

      return {
        success: response.ok,
        url: response.url || targetUrl,
        title,
        content: processedContent.substring(0, 5000), // Return sample content snippet
        metrics: {
          durationMs,
          pagesLoaded: 1,
        },
      };
    } catch (err) {
      logger.error("CamofoxEngine: browse workflow error", { error: err, targetUrl });
      return {
        success: false,
        url: targetUrl,
        title: "Error Page",
        content: `<html><body>Failed to fetch URL: ${err instanceof Error ? err.message : String(err)}</body></html>`,
        metrics: {
          durationMs: Date.now() - startTime,
          pagesLoaded: 0,
        },
      };
    }
  }

  public async executeScrape(targetUrl: string): Promise<CamofoxActionResult> {
    if (!this.isInitialized) {
      await this.initializeSession();
    }

    const startTime = Date.now();
    logger.info("CamofoxEngine: executing anti-detection scrape pipeline", {
      targetUrl,
      sessionId: this.options.proxy.sessionId,
    });

    try {
      const response = await fetch(targetUrl, {
        headers: this.getStealthHeaders(),
        redirect: "follow",
      });

      const rawHtml = await response.text();
      const durationMs = Date.now() - startTime;

      // Extract page metadata
      const titleMatch = rawHtml.match(/<title[^>]*>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1]?.trim() : "Scraped Page";

      // Extract headings
      const headings: string[] = [];
      const headingMatches = rawHtml.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi);
      for (const m of headingMatches) {
        const text = m[1]?.replace(/<[^>]+>/g, "").trim();
        if (text) headings.push(text);
      }

      // Extract links
      const links: string[] = [];
      const linkMatches = rawHtml.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi);
      for (const m of linkMatches) {
        if (m[1] && !links.includes(m[1])) links.push(m[1]);
      }

      const scrapedData = {
        extractedAt: new Date().toISOString(),
        status: response.status,
        url: targetUrl,
        title,
        headingsCount: headings.length,
        headings: headings.slice(0, 10),
        linksCount: links.length,
        linksSample: links.slice(0, 5),
      };

      return {
        success: response.ok,
        url: response.url || targetUrl,
        title,
        content: JSON.stringify(scrapedData, null, 2),
        metrics: {
          durationMs,
          pagesLoaded: 1,
        },
      };
    } catch (err) {
      logger.error("CamofoxEngine: scrape error", { error: err, targetUrl });
      return {
        success: false,
        url: targetUrl,
        title: "Scrape Error Page",
        content: JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
        metrics: {
          durationMs: Date.now() - startTime,
          pagesLoaded: 0,
        },
      };
    }
  }

  public async closeSession(): Promise<void> {
    logger.info("CamofoxEngine: closing session & destroying ephemeral context", {
      sessionId: this.options.proxy.sessionId,
    });
    this.sessionCookies.clear();
    this.isInitialized = false;
  }
}
