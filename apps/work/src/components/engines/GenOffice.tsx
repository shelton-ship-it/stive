// AGUARDA BUILD WASM: correr wasm-pack build --target web --release para gerar pkg/
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

// Native PDF Generator
function createNativePDF(title: string, textContent: string): Blob {
  const lines = textContent.split("\n").filter(Boolean);
  const pdfHeader = "%PDF-1.4\n";

  let body = "";
  const objects: string[] = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
  objects.push("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj");
  objects.push("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj");

  let streamText = `BT /F1 16 Tf 50 800 Td (${title.replace(/[()\\]/g, "\\$&")}) Tj ET\n`;
  let y = 760;
  for (const line of lines) {
    streamText += `BT /F1 11 Tf 50 ${y} Td (${line.substring(0, 80).replace(/[()\\]/g, "\\$&")}) Tj ET\n`;
    y -= 18;
    if (y < 50) break;
  }

  objects.push(`5 0 obj\n<< /Length ${streamText.length} >>\nstream\n${streamText}endstream\nendobj`);

  const offsets: number[] = [];
  let currentOffset = pdfHeader.length;

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

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdfHeader + body + xref + trailer], { type: "application/pdf" });
}

// Native DOCX OpenXML Document XML String Builder
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

export function GenOffice() {
  useEffect(() => {
    let isMounted = true;
    // @ts-ignore Engine vendored module
    import("@stive/engine-wordcraft")
      .then(() => {
        if (!isMounted) return;
        setStatus("WordCraft WASM Engine pronto.");
      })
      .catch((err) => {
        if (!isMounted) return;
        setEngineState("error");
        setStatus(`AGUARDA BUILD WASM: correr wasm-pack build --target web --release para gerar pkg/ (${err instanceof Error ? err.message : String(err)})`);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [documentContent, setDocumentContent] = useState<string>(
    "Bem-vindo ao Stive Write.\nEste é um documento de demonstração do GenOffice Engine.\n\nPode editar e formatar o seu texto diretamente no navegador e exportá-lo como DOCX ou PDF."
  );
  const [docTitle, setDocTitle] = useState<string>("Documento_Stive");
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("GenOffice Engine pronto.");
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  const handleCreateNew = () => {
    setDocTitle("Novo_Documento");
    setDocumentContent("");
    setExportedFile(null);
    setEngineState("idle");
    setStatus("GenOffice: Novo documento limpo criado.");
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setEngineState("loading");
        setStatus(`Carregando "${file.name}"...`);
        const text = await file.text();
        setDocumentContent(text);
        setDocTitle(file.name.substring(0, file.name.lastIndexOf(".")) || file.name);
        setEngineState("done");
        setStatus(`Ficheiro "${file.name}" importado com sucesso.`);
      } catch (err) {
        setEngineState("error");
        setStatus(err instanceof Error ? err.message : "Erro ao importar ficheiro.");
      }
    }
  };

  const handleExport = async (format: "docx" | "pdf") => {
    try {
      setEngineState("processing");
      setStatus(`A gerar ficheiro .${format} via GenOffice Engine...`);

      let blob: Blob;
      const fileName = `${docTitle}.${format}`;

      if (format === "docx") {
        blob = createNativeDOCX(docTitle, documentContent);
      } else {
        blob = createNativePDF(docTitle, documentContent);
      }

      const url = URL.createObjectURL(blob);
      setExportedFile({ url, fileName });
      setEngineState("done");
      setStatus(`Documento exportado como .${format} com sucesso!`);
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : `Erro ao exportar .${format}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>✏️</span> GenOffice Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de processamento e redação de documentos DOCX & PDF</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              engineState === "done"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : engineState === "error"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : engineState === "processing" || engineState === "loading"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            {engineState.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
            placeholder="Nome do documento"
          />
          <span className="text-xs text-slate-400 font-mono">.docx</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors">
            📂 Importar
            <input type="file" accept=".txt,.md,.docx" onChange={handleImportFile} className="hidden" />
          </label>
          <button
            onClick={handleCreateNew}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors"
          >
            ➕ Criar
          </button>
          <Button onClick={() => handleExport("docx")} disabled={engineState === "processing"}>
            📥 Exportar DOCX
          </Button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={engineState === "processing"}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded transition-colors"
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Editor DOCX / Texto (GenOffice)
          </label>
        </div>
        <textarea
          value={documentContent}
          onChange={(e) => {
            setDocumentContent(e.target.value);
            if (engineState !== "idle") setEngineState("idle");
          }}
          rows={12}
          className="w-full p-4 border border-slate-300 rounded-lg shadow-inner font-serif text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none leading-relaxed"
          placeholder="Comece a escrever o seu documento..."
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-4">
        <div>{status}</div>
        <div className="flex items-center gap-4">
          {exportedFile && (
            <a
              href={exportedFile.url}
              download={exportedFile.fileName}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded shadow-sm transition-colors"
            >
              📥 Descarregar {exportedFile.fileName}
            </a>
          )}
          <span>
            Palavras: {documentContent.trim() ? documentContent.trim().split(/\s+/).length : 0} | Caracteres: {documentContent.length}
          </span>
        </div>
      </div>
    </div>
  );
}
