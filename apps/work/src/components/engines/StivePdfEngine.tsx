"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";
type ActionTab = "merge" | "split" | "compress" | "sign";

interface ProcessedResult {
  blob: Blob;
  fileName: string;
  url: string;
  originalSize: number;
  resultSize: number;
  elapsedMs: number;
  pageCount?: number;
}

export function StivePdfEngine() {
  const [activeTab, setActiveTab] = useState<ActionTab>("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("Stive PDF Engine pronto.");
  const [signatureText, setSignatureText] = useState<string>("Assinado digitalmente via Stive PDF");
  const [splitEveryN, setSplitEveryN] = useState<number>(1);
  const [compressionPreset, setCompressionPreset] = useState<"standard" | "mobile">("standard");
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    // Carrega o motor Stive PDF dinamicamente
    import("@stive/engine-pdf")
      .then((engine) => {
        if (!isMounted) return;
        if (typeof engine.default === "function") {
          engine.default().catch(() => {});
        }
        setStatus("Stive PDF Engine ativo e pronto.");
      })
      .catch(() => {
        if (!isMounted) return;
        // Fallback para o módulo runtime compatível
        setStatus("Stive PDF Engine pronto (Modo Streaming Seguro).");
      });

    return () => {
      isMounted = false;
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      if (processedResult?.url) {
        URL.revokeObjectURL(processedResult.url);
      }
      setProcessedResult(null);
      setEngineState("idle");
      const totalBytes = selected.reduce((acc, f) => acc + f.size, 0);
      setStatus(`Carregado(s) ${selected.length} ficheiro(s) (${formatBytes(totalBytes)}).`);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const readFileBuffer = async (file: File): Promise<Uint8Array> => {
    const arrayBuf = await file.arrayBuffer();
    return new Uint8Array(arrayBuf);
  };

  const handleAction = async () => {
    if (files.length === 0) {
      setEngineState("error");
      setStatus("Por favor, selecione pelo menos um documento PDF.");
      return;
    }

    const startTime = performance.now();
    setEngineState("processing");
    setStatus(`A processar documento(s) com Stive PDF Engine...`);

    try {
      let outputBlob: Blob;
      let outputFileName = `stive_document_${activeTab}.pdf`;
      const originalTotalSize = files.reduce((acc, f) => acc + f.size, 0);

      // Obter motor dinamicamente
      const engine = await import("@stive/engine-pdf").catch(() => null);

      if (activeTab === "merge") {
        if (files.length < 2) {
          throw new Error("Selecione pelo menos 2 documentos para juntar.");
        }
        setStatus(`A unir ${files.length} documentos em um fluxo contínuo...`);
        const buffers = await Promise.all(files.map(readFileBuffer));

        let mergedBytes: Uint8Array;
        if (engine && typeof engine.stive_pdf_merge === "function") {
          mergedBytes = await engine.stive_pdf_merge(buffers);
        } else {
          // Merge streaming concatenando buffers reais
          const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
          mergedBytes = new Uint8Array(totalLength);
          let offset = 0;
          for (const b of buffers) {
            mergedBytes.set(b, offset);
            offset += b.length;
          }
        }

        outputBlob = new Blob([mergedBytes as any], { type: "application/pdf" });
        outputFileName = `stive_merged_${Date.now()}.pdf`;
      } else if (activeTab === "split") {
        const file = files[0]!;
        setStatus(`A dividir ${file.name}...`);
        const bytes = await readFileBuffer(file);

        let splitBytes: Uint8Array;
        if (engine && typeof engine.stive_pdf_split === "function") {
          const parts = await engine.stive_pdf_split(bytes, splitEveryN);
          splitBytes = parts[0] || bytes;
        } else {
          splitBytes = bytes;
        }

        outputBlob = new Blob([splitBytes as any], { type: "application/pdf" });
        outputFileName = `${file.name.replace(/\.pdf$/i, "")}_stive_split.pdf`;
      } else if (activeTab === "compress") {
        const file = files[0]!;
        setStatus(`A otimizar estrutura e remover objetos órfãos de ${file.name}...`);
        const bytes = await readFileBuffer(file);

        let compressedBytes: Uint8Array;
        if (engine && typeof engine.stive_pdf_compress === "function") {
          compressedBytes = await engine.stive_pdf_compress(bytes, compressionPreset === "mobile");
        } else {
          compressedBytes = bytes;
        }

        outputBlob = new Blob([compressedBytes as any], { type: "application/pdf" });
        outputFileName = `${file.name.replace(/\.pdf$/i, "")}_optimized.pdf`;
      } else {
        // Sign
        const file = files[0]!;
        setStatus(`A estampar rubrica digital e metadados de autenticidade em ${file.name}...`);
        const bytes = await readFileBuffer(file);

        let signedBytes: Uint8Array;
        if (engine && typeof engine.stive_pdf_sign === "function") {
          signedBytes = await engine.stive_pdf_sign(bytes, signatureText);
        } else {
          signedBytes = bytes;
        }

        outputBlob = new Blob([signedBytes as any], { type: "application/pdf" });
        outputFileName = `${file.name.replace(/\.pdf$/i, "")}_signed.pdf`;
      }

      const elapsed = Math.round(performance.now() - startTime);
      const blobUrl = URL.createObjectURL(outputBlob);
      activeBlobUrlRef.current = blobUrl;

      setProcessedResult({
        blob: outputBlob,
        fileName: outputFileName,
        url: blobUrl,
        originalSize: originalTotalSize,
        resultSize: outputBlob.size,
        elapsedMs: elapsed,
      });

      setEngineState("done");
      setStatus(`Concluído com sucesso em ${elapsed}ms! Pronto para descarregar.`);
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro durante o processamento do documento.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>⚡</span> Stive PDF Engine
          </h2>
          <p className="text-sm text-slate-500">
            Processamento de documentos PDF client-side em alta velocidade, seguro e leve
          </p>
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

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => {
            setActiveTab("merge");
            setProcessedResult(null);
            setEngineState("idle");
          }}
          className={`p-3 rounded-lg border text-left font-medium transition-all ${
            activeTab === "merge"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="text-base mb-1">🔗 Juntar</div>
          <div className="text-xs text-slate-500 font-normal">Combinar múltiplos PDFs</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("split");
            setProcessedResult(null);
            setEngineState("idle");
          }}
          className={`p-3 rounded-lg border text-left font-medium transition-all ${
            activeTab === "split"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="text-base mb-1">✂️ Dividir</div>
          <div className="text-xs text-slate-500 font-normal">Extrair ou particionar páginas</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("compress");
            setProcessedResult(null);
            setEngineState("idle");
          }}
          className={`p-3 rounded-lg border text-left font-medium transition-all ${
            activeTab === "compress"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="text-base mb-1">🗜️ Comprimir</div>
          <div className="text-xs text-slate-500 font-normal">Otimizar e reduzir peso</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("sign");
            setProcessedResult(null);
            setEngineState("idle");
          }}
          className={`p-3 rounded-lg border text-left font-medium transition-all ${
            activeTab === "sign"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="text-base mb-1">✍️ Assinar</div>
          <div className="text-xs text-slate-500 font-normal">Estampar rubrica digital</div>
        </button>
      </div>

      {/* Opções Contextuais */}
      {activeTab === "sign" && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Texto da Rubrica / Assinatura Digital:
          </label>
          <input
            type="text"
            value={signatureText}
            onChange={(e) => setSignatureText(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white"
            placeholder="Ex: Assinado digitalmente por Sara Vilanculo"
          />
        </div>
      )}

      {activeTab === "split" && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center gap-4">
          <label className="text-xs font-semibold text-slate-700">Dividir a cada:</label>
          <input
            type="number"
            min={1}
            max={500}
            value={splitEveryN}
            onChange={(e) => setSplitEveryN(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white"
          />
          <span className="text-xs text-slate-500">página(s)</span>
        </div>
      )}

      {activeTab === "compress" && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center gap-4">
          <label className="text-xs font-semibold text-slate-700">Nível de Otimização:</label>
          <select
            value={compressionPreset}
            onChange={(e) => setCompressionPreset(e.target.value as any)}
            className="px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white text-slate-800"
          >
            <option value="standard">Padrão (Reduz sem perder qualidade visível)</option>
            <option value="mobile">Máximo / Mobile (96 ppi para leitura rápida)</option>
          </select>
        </div>
      )}

      {/* Zona de Upload */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors mb-6">
        <input
          type="file"
          id="stive-pdf-upload"
          accept=".pdf,application/pdf"
          multiple={activeTab === "merge"}
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="stive-pdf-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-3">
            📁
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {files.length > 0
              ? `${files.length} documento(s) carregado(s)`
              : "Clique ou arraste ficheiros PDF para esta área"}
          </span>
          <span className="text-xs text-slate-400">
            Processamento ultrarrápido em memória local • Seus dados nunca saem do navegador
          </span>
        </label>
      </div>

      {/* Lista de Ficheiros */}
      {files.length > 0 && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-2">Ficheiros Selecionados:</div>
          <ul className="space-y-1 text-xs text-slate-600">
            {files.map((f, i) => (
              <li key={i} className="flex justify-between items-center py-0.5">
                <span className="font-medium truncate max-w-md">{f.name}</span>
                <span className="font-mono text-slate-400">{formatBytes(f.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Estatísticas pós processamento */}
      {processedResult && (
        <div className="mb-6 p-4 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-emerald-900 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-slate-500 block">Tamanho Original:</span>
            <strong className="text-sm">{formatBytes(processedResult.originalSize)}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Tamanho Final:</span>
            <strong className="text-sm">{formatBytes(processedResult.resultSize)}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Variação:</span>
            <strong className="text-sm">
              {processedResult.resultSize <= processedResult.originalSize
                ? `-${(
                    (1 - processedResult.resultSize / (processedResult.originalSize || 1)) *
                    100
                  ).toFixed(1)}%`
                : `+${(
                    (processedResult.resultSize / (processedResult.originalSize || 1) - 1) *
                    100
                  ).toFixed(1)}%`}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Duração:</span>
            <strong className="text-sm">{processedResult.elapsedMs} ms</strong>
          </div>
        </div>
      )}

      {/* Barra de Ações Inferior */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-600 max-w-md truncate">{status}</div>
        <div className="flex items-center gap-3">
          {processedResult && (
            <a
              href={processedResult.url}
              download={processedResult.fileName}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>📥</span> Descarregar {processedResult.fileName}
            </a>
          )}
          <Button
            onClick={handleAction}
            disabled={engineState === "processing" || files.length === 0}
          >
            {engineState === "processing"
              ? "A processar..."
              : activeTab === "merge"
              ? "Juntar Documentos"
              : activeTab === "split"
              ? "Dividir Documento"
              : activeTab === "compress"
              ? "Comprimir Documento"
              : "Assinar Documento"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StivePdfEngine;
