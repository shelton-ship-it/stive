import { describe, it } from "node:test";
import assert from "node:assert";
import { StrixEngine } from "./StrixEngine.js";

describe("StrixEngine Security Scanner", () => {
  it("should run SAST scan and detect dynamic eval and hardcoded secrets", async () => {
    const codeSample = `
      const key = "AWS_SECRET_KEY=1234567890abcdef";
      eval("console.log(key)");
      element.innerHTML = "<p>Unsafe</p>";
    `;

    const engine = new StrixEngine({ target: codeSample, scanType: "sast" });
    const result = await engine.runScan();

    assert.strictEqual(result.scanType, "sast");
    assert.ok(result.findings.length >= 2, "Should find at least 2 SAST findings");

    const evalFinding = result.findings.find((f) => f.ruleId === "STRIX-SAST-001");
    assert.ok(evalFinding, "Should detect eval");
    assert.strictEqual(evalFinding?.severity, "CRITICAL");

    const secretFinding = result.findings.find((f) => f.ruleId === "STRIX-SAST-002");
    assert.ok(secretFinding, "Should detect secret");
  });

  it("should generate valid SARIF 2.1.0 report", async () => {
    const engine = new StrixEngine({ target: "console.log(1)", scanType: "sast" });
    const scanResult = await engine.runScan();
    const sarif = await engine.generateSarifReport(scanResult);

    assert.strictEqual(sarif.version, "2.1.0");
    assert.strictEqual(sarif.runs[0]?.tool.driver.name, "Strix Security Engine");
    assert.ok(Array.isArray(sarif.runs[0]?.results));
  });
});
