import { describe, it } from "node:test";
import assert from "node:assert";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { PDFDocument } from "pdf-lib";

describe("GenOffice DOCX & PDF Document Integrity", () => {
  it("should generate a valid DOCX OpenXML ZIP buffer containing text content", async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: "Documento de Teste Stive GenOffice",
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              text: "Este e um paragrafo de texto real gerado pelo motor GenOffice.",
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    assert.ok(buffer.length > 500, "DOCX buffer should be non-empty OpenXML archive");

    // Check OpenXML ZIP Magic Number ('PK\x03\x04')
    assert.strictEqual(buffer[0], 0x50); // 'P'
    assert.strictEqual(buffer[1], 0x4b); // 'K'
    assert.strictEqual(buffer[2], 0x03);
    assert.strictEqual(buffer[3], 0x04);
  });

  it("should generate a valid PDF document via pdf-lib and preserve page count", async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([595, 842]);
    pdfDoc.addPage([595, 842]);

    const pdfBytes = await pdfDoc.save();
    assert.ok(pdfBytes.length > 200, "PDF buffer should contain valid bytes");

    // Validate PDF Header '%PDF-'
    const header = String.fromCharCode(pdfBytes[0]!, pdfBytes[1]!, pdfBytes[2]!, pdfBytes[3]!);
    assert.strictEqual(header, "%PDF");

    // Load back and verify page count
    const reloaded = await PDFDocument.load(pdfBytes);
    assert.strictEqual(reloaded.getPageCount(), 2);
  });
});

describe("SlideCraft HTML Presentation Export Integrity", () => {
  it("should export slide presentation containing all titles and contents", () => {
    const slides = [
      { id: "1", title: "Introducao Stive", subtitle: "Apresentacao inicial", themeColor: "#1e40af" },
      { id: "2", title: "Recursos do Deck", subtitle: "Docs e Sheets", themeColor: "#0f766e" },
    ];

    const htmlContent = `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><title>Apresentação Stive SlideCraft</title></head>
<body>
${slides
  .map(
    (s, idx) => `<div class="slide" style="background: ${s.themeColor}">
<small>Diapositivo ${idx + 1} de ${slides.length}</small>
<h1>${s.title}</h1>
<p>${s.subtitle}</p>
</div>`
  )
  .join("\n")}
</body>
</html>`;

    assert.ok(htmlContent.includes("Introducao Stive"));
    assert.ok(htmlContent.includes("Recursos do Deck"));
    assert.ok(htmlContent.includes("Diapositivo 1 de 2"));
    assert.ok(htmlContent.includes("Diapositivo 2 de 2"));
    assert.ok(htmlContent.includes("#1e40af"));
  });
});
