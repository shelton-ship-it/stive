"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function GenOffice() {
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

  const generateDocxBlob = async (): Promise<Blob> => {
    const paragraphs = documentContent.split("\n").map((line) => {
      if (line.startsWith("# ")) {
        return new Paragraph({
          text: line.replace("# ", ""),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.LEFT,
        });
      }
      return new Paragraph({
        children: [
          new TextRun({
            text: line,
            font: "Calibri",
            size: 24, // 12pt
          }),
        ],
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: docTitle.replace(/_/g, " "),
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.LEFT,
            }),
            ...paragraphs,
          ],
        },
      ],
    });

    return await Packer.toBlob(doc);
  };

  const generatePdfBlob = async (): Promise<Blob> => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;

    // Title
    page.drawText(docTitle.replace(/_/g, " "), {
      x: 50,
      y,
      size: 20,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 40;

    // Content lines
    const lines = documentContent.split("\n");
    for (const line of lines) {
      if (y < 50) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }

      if (line.trim().length === 0) {
        y -= 15;
        continue;
      }

      const isHeading = line.startsWith("# ");
      const textToDraw = isHeading ? line.replace("# ", "") : line;
      const fontSize = isHeading ? 14 : 11;
      const currentFont = isHeading ? boldFont : font;

      page.drawText(textToDraw.substring(0, 80), {
        x: 50,
        y,
        size: fontSize,
        font: currentFont,
        color: rgb(0.2, 0.2, 0.2),
      });

      y -= fontSize + 8;
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  };

  const handleExport = async (format: "docx" | "pdf") => {
    try {
      setEngineState("loading");
      setStatus(`A preparar exportação de "${docTitle}"...`);

      setEngineState("processing");
      setStatus(`Gerando ficheiro .${format} via GenOffice Engine...`);

      let blob: Blob;
      let fileName = `${docTitle}.${format}`;

      if (format === "docx") {
        blob = await generateDocxBlob();
      } else {
        blob = await generatePdfBlob();
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
          <span className="text-xs text-slate-400">Dica: Comece uma linha com `# ` para título</span>
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
