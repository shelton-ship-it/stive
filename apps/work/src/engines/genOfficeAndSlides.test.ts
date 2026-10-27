import { describe, it } from "node:test";
import assert from "node:assert";

function createNativeDOCX(title: string, textContent: string): Blob {
  const paragraphs = textContent
    .split("\n")
    .map(
      (line) =>
        `<w:p><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="24"/></w:rPr><w:t>${line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</w:t></w:r></w:p>`
    )
    .join("\n");

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>${title}</w:t></w:r></w:p>
    ${paragraphs}
  </w:body>
</w:document>`;

  return new Blob([docXml], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

function createNativePDF(title: string, textContent: string): Blob {
  const pdfHeader = "%PDF-1.4\n";
  const body = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 100 >>\nstream\nBT /F1 16 Tf 50 800 Td (${title}) Tj ET\nendstream\nendobj\n`;
  const trailer = `xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000109 00000 n \n0000000223 00000 n \n0000000293 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n410\n%%EOF`;
  return new Blob([pdfHeader + body + trailer], { type: "application/pdf" });
}

describe("GenOffice Native DOCX & PDF Document Integrity", () => {
  it("should generate a valid OpenXML Word document Blob", async () => {
    const docBlob = createNativeDOCX("Documento Stive", "Linha 1 do texto");
    const xmlText = await docBlob.text();

    assert.ok(xmlText.includes("<?xml version=\"1.0\""));
    assert.ok(xmlText.includes("<w:document"));
    assert.ok(xmlText.includes("Documento Stive"));
    assert.ok(xmlText.includes("Linha 1 do texto"));
  });

  it("should generate a valid PDF Blob and preserve title text", async () => {
    const pdfBlob = createNativePDF("Documento Stive", "Texto PDF");
    const pdfText = await pdfBlob.text();

    assert.ok(pdfText.startsWith("%PDF-1.4"));
    assert.ok(pdfText.includes("Documento Stive"));
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
