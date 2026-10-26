import { describe, it } from "node:test";
import assert from "node:assert";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

describe("PDFCraft Engine Logic (pdf-lib)", () => {
  it("should create and merge two PDF documents into one", async () => {
    // Create doc 1
    const doc1 = await PDFDocument.create();
    doc1.addPage([200, 200]);

    // Create doc 2
    const doc2 = await PDFDocument.create();
    doc2.addPage([200, 200]);

    const bytes1 = await doc1.save();
    const bytes2 = await doc2.save();

    // Merge
    const merged = await PDFDocument.create();
    const loaded1 = await PDFDocument.load(bytes1);
    const loaded2 = await PDFDocument.load(bytes2);

    const pages1 = await merged.copyPages(loaded1, loaded1.getPageIndices());
    pages1.forEach((p) => merged.addPage(p));

    const pages2 = await merged.copyPages(loaded2, loaded2.getPageIndices());
    pages2.forEach((p) => merged.addPage(p));

    assert.strictEqual(merged.getPageCount(), 2);
  });

  it("should draw text signature visual stamp on first page of PDF", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([500, 500]);
    const font = await doc.embedFont(StandardFonts.Helvetica);

    page.drawText("Assinado por Stive PDFCraft", {
      x: 50,
      y: 50,
      size: 12,
      font,
      color: rgb(0, 0, 1),
    });

    const pdfBytes = await doc.save();
    const loaded = await PDFDocument.load(pdfBytes);
    assert.strictEqual(loaded.getPageCount(), 1);
  });
});
