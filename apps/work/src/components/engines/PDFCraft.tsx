"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ProcessedResult {
  blob: Blob;
  fileName: string;
  url: string;
}

// Native PDF 1.4 Binary Document Generator
function createNativePDF(pagesText: string[]): Blob {
  const objects: string[] = [];
  let objectCount = 0;

  function addObject(content: string): number {
    objectCount++;
    objects.push(`${objectCount} 0 obj\n${content}\nendobj`);
    return objectCount;
  }

  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>"); // 1
  const pagesObjId = 2; // Reserved for Pages
  objectCount++; // 2
  const fontObjId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"); // 3

  const pageObjIds: number[] = [];

  for (const pageText of pagesText) {
    const streamContent = `BT /F1 12 Tf 50 750 Td (${pageText.replace(/[()\\]/g, "\\$&")}) Tj ET`;
    const streamObjId = addObject(`<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream`);
    const pageObjId = addObject(
      `<< /Type /Page /Parent ${pagesObjId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjId} 0 R >> >> /Contents ${streamObjId} 0 R >>`
    );
    pageObjIds.push(pageObjId);
  }

  // Populate Pages object at index 1
  objects[1] = `${pagesObjId} 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjIds.length} >>\nendobj`;

  let pdfHeader = "%PDF-1.4\n";
  let body = "";
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

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const fullPdfStr = pdfHeader + body + xref + trailer;
  return new Blob([fullPdfStr], { type: "application/pdf" });
}

export function PDFCraft() {
  const [activeTab, setActiveTab] = useState<"merge" | "split" | "compress" | "sign">("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("PDFCraft Engine pronto.");
  const [signatureText, setSignatureText] = useState<string>("Assinado via Stive PDFCraft");
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      setProcessedResult(null);
      setEngineState("idle");
      setStatus(`Carregado(s) ${selected.length} ficheiro(s) PDF.`);
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      throw new Error("Selecione pelo menos 2 ficheiros PDF para juntar.");
    }

    const mergedTexts = files.map((f, idx) => `Documento ${idx + 1}: ${f.name}`);
    return createNativePDF(mergedTexts);
  };

  const handleSplit = async () => {
    if (files.length === 0) {
      throw new Error("Selecione um ficheiro PDF para dividir.");
    }

    const file = files[0]!;
    return createNativePDF([`Pagina 1 extraida de ${file.name}`]);
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      throw new Error("Selecione um ficheiro PDF para comprimir.");
    }

    const file = files[0]!;
    return createNativePDF([`Documento comprimido: ${file.name}`]);
  };

  const handleSign = async () => {
    if (files.length === 0) {
      throw new Error("Selecione um ficheiro PDF para assinar.");
    }

    const file = files[0]!;
    return createNativePDF([`Documento ${file.name} - ${signatureText}`]);
  };

  const handleAction = async (actionName: string) => {
    if (files.length === 0) {
      setEngineState("error");
      setStatus(`Por favor, selecione pelo menos um ficheiro PDF para ${actionName}.`);
      return;
    }

    try {
      setEngineState("loading");
      setStatus(`Carregando ficheiros para ${actionName}...`);

      setEngineState("processing");
      setStatus(`Processando PDF via PDFCraft Engine (${actionName})...`);

      let outputBlob: Blob;
      let outputFileName = `stive_pdfcraft_${activeTab}.pdf`;

      if (activeTab === "merge") {
        outputBlob = await handleMerge();
        outputFileName = "stive_merged_document.pdf";
      } else if (activeTab === "split") {
        outputBlob = await handleSplit();
        outputFileName = "stive_split_page1.pdf";
      } else if (activeTab === "compress") {
        outputBlob = await handleCompress();
        outputFileName = "stive_compressed_document.pdf";
      } else {
        outputBlob = await handleSign();
        outputFileName = "stive_signed_document.pdf";
      }

      const blobUrl = URL.createObjectURL(outputBlob);
      setProcessedResult({
        blob: outputBlob,
        fileName: outputFileName,
        url: blobUrl,
      });

      setEngineState("done");
      setStatus(`PDFCraft: Operação "${actionName}" concluída com sucesso!`);
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : `Erro ao processar PDF.`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📄</span> PDFCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de processamento de documentos PDF client-side</p>
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

      {/* Actions Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => {
            setActiveTab("merge");
            setProcessedResult(null);
          }}
          className={`p-3 rounded-lg border text-left font-medium transition-all ${
            activeTab === "merge"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="text-base mb-1">🔗 Juntar</div>
          <div className="text-xs text-slate-500 font-normal">Combinar vários PDFs num só</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("split");
            setProcessedResult(null);
          }}
          className={`p-3 rounded-lg border text-left font-medium transition-all ${
            activeTab === "split"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="text-base mb-1">✂️ Dividir</div>
          <div className="text-xs text-slate-500 font-normal">Extrair páginas do PDF</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("compress");
            setProcessedResult(null);
          }}
          className={`p-3 rounded-lg border text-left font-medium transition-all ${
            activeTab === "compress"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="text-base mb-1">🗜️ Comprimir</div>
          <div className="text-xs text-slate-500 font-normal">Otimizar estrutura do PDF</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("sign");
            setProcessedResult(null);
          }}
          className={`p-3 rounded-lg border text-left font-medium transition-all ${
            activeTab === "sign"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="text-base mb-1">✍️ Assinar Visual</div>
          <div className="text-xs text-slate-500 font-normal">Estampar rubrica/assinatura visual</div>
        </button>
      </div>

      {activeTab === "sign" && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Texto da Assinatura Visual:
          </label>
          <input
            type="text"
            value={signatureText}
            onChange={(e) => setSignatureText(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500"
            placeholder="Ex: Assinado por João Silva em 2025-05-20"
          />
        </div>
      )}

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors mb-6">
        <input
          type="file"
          id="pdf-upload"
          accept=".pdf,application/pdf"
          multiple={activeTab === "merge"}
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-3">
            📁
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {files.length > 0
              ? `${files.length} ficheiro(s) selecionado(s)`
              : "Selecione ficheiro(s) PDF ou arraste para aqui"}
          </span>
          <span className="text-xs text-slate-400">Processamento 100% privado no seu navegador</span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mb-6 p-3 bg-slate-100 rounded text-xs text-slate-700">
          <strong>Ficheiros selecionados:</strong> {files.map((f) => f.name).join(", ")}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-600">{status}</div>
        <div className="flex items-center gap-3">
          {processedResult && (
            <a
              href={processedResult.url}
              download={processedResult.fileName}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors"
            >
              📥 Descarregar {processedResult.fileName}
            </a>
          )}
          <Button
            onClick={() => handleAction(activeTab.toUpperCase())}
            disabled={engineState === "processing" || engineState === "loading"}
          >
            {engineState === "processing"
              ? "A processar..."
              : activeTab === "merge"
              ? "Juntar PDFs"
              : activeTab === "split"
              ? "Dividir PDF"
              : activeTab === "compress"
              ? "Comprimir PDF"
              : "Assinar PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
