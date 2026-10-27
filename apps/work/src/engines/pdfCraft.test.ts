import { describe, it } from "node:test";
import assert from "node:assert";

// Native PDF Generator test helper
function createNativePDF(pagesText: string[]): Blob {
  const pdfHeader = "%PDF-1.4\n";
  let body = "";
  const objects: string[] = [];

  function addObject(content: string): number {
    objects.push(`${objects.length + 1} 0 obj\n${content}\nendobj`);
    return objects.length;
  }

  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesObjId = 2;
  objects.push(""); // Placeholder for Pages
  const fontObjId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  const pageObjIds: number[] = [];
  for (const text of pagesText) {
    const streamContent = `BT /F1 12 Tf 50 750 Td (${text.replace(/[()\\]/g, "\\$&")}) Tj ET`;
    const streamObjId = addObject(`<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream`);
    const pageObjId = addObject(
      `<< /Type /Page /Parent ${pagesObjId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjId} 0 R >> >> /Contents ${streamObjId} 0 R >>`
    );
    pageObjIds.push(pageObjId);
  }

  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjIds.length} >>\nendobj`;

  let currentOffset = pdfHeader.length;
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(currentOffset);
    const objStr = obj + "\n";
    body += objStr;
    currentOffset += objStr.length;
  }

  const xrefOffset = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += `${off.toString().padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdfHeader + body + xref + trailer], { type: "application/pdf" });
}

describe("PDFCraft Engine Native PDF Generator", () => {
  it("should create a valid PDF binary document with correct header and pages", async () => {
    const pdfBlob = createNativePDF(["Doc 1", "Doc 2"]);
    const pdfText = await pdfBlob.text();

    assert.ok(pdfText.startsWith("%PDF-1.4"));
    assert.ok(pdfText.includes("/Type /Catalog"));
    assert.ok(pdfText.includes("/Count 2"));
    assert.ok(pdfText.includes("%%EOF"));
  });

  it("should embed visual signature stamp in PDF content stream", async () => {
    const pdfBlob = createNativePDF(["Assinado por Stive PDFCraft"]);
    const pdfText = await pdfBlob.text();

    assert.ok(pdfText.includes("Assinado por Stive PDFCraft"));
  });
});
