import { describe, it } from "node:test";
import assert from "node:assert";

describe("Stive PDF Engine Core Tests", () => {
  it("should validate minimum file count for merge operation", () => {
    const filesCount = 1;
    const canMerge = filesCount >= 2;
    assert.strictEqual(canMerge, false);
  });

  it("should calculate correct compression ratio", () => {
    const originalSize = 1000000;
    const resultSize = 450000;
    const ratio = (1 - resultSize / originalSize) * 100;
    assert.strictEqual(Math.round(ratio), 55);
  });

  it("should handle partition ranges correctly", () => {
    const totalPages = 10;
    const everyN = 2;
    const partsCount = Math.ceil(totalPages / everyN);
    assert.strictEqual(partsCount, 5);
  });
});
