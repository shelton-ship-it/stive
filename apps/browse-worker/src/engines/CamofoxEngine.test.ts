import { describe, it } from "node:test";
import assert from "node:assert";
import { CamofoxEngine } from "./CamofoxEngine.js";

describe("CamofoxEngine Browser Automation Worker", () => {
  it("should initialize session and execute scrape workflow", async () => {
    const engine = new CamofoxEngine({
      proxy: { server: "http://proxy.internal:8080", sessionId: "session-123" },
      fingerprintRandomization: true,
    });

    await engine.initializeSession();

    const scrapeResult = await engine.executeScrape("https://example.com");
    assert.strictEqual(typeof scrapeResult.success, "boolean");
    assert.ok(scrapeResult.metrics);
    assert.ok(scrapeResult.metrics.durationMs >= 0);

    await engine.closeSession();
  });
});
