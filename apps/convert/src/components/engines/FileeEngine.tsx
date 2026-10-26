"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ConvertedResult {
  blob: Blob;
  fileName: string;
  url: string;
}

export function FileeEngine() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("PNG");
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("Filee Engine pronto para conversão.");
  const [convertedResult, setConvertedResult] = useState<ConvertedResult | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setConvertedResult(null);
    setEngineState("idle");
    setStatusMessage(`Ficheiro carregado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
  };

  const convertImage = async (file: File, format: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          return reject(new Error("Não foi possível obter contexto do Canvas."));
        }
        ctx.drawImage(img, 0, 0);

        let mimeType = "image/png";
        if (format === "JPG" || format === "JPEG") mimeType = "image/jpeg";
        if (format === "WEBP") mimeType = "image/webp";

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("Falha ao gerar o ficheiro convertido."));
        }, mimeType, 0.92);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Falha ao carregar o ficheiro de imagem."));
      };

      img.src = url;
    });
  };

  const convertTextDocument = async (file: File, format: string): Promise<Blob> => {
    const textContent = await file.text();
    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

    if (format === "JSON") {
      let jsonObj: unknown;
      try {
        jsonObj = JSON.parse(textContent);
      } catch {
        // If text is not valid JSON, create a structure with content
        jsonObj = { filename: baseName, content: textContent };
      }
      return new Blob([JSON.stringify(jsonObj, null, 2)], { type: "application/json" });
    }

    if (format === "TXT") {
      return new Blob([textContent], { type: "text/plain;charset=utf-8" });
    }

    if (format === "HTML") {
      const htmlDoc = `<!DOCTYPE html><html><head><title>${baseName}</title></head><body><pre>${textContent}</pre></body></html>`;
      return new Blob([htmlDoc], { type: "text/html;charset=utf-8" });
    }

    // Default return text blob
    return new Blob([textContent], { type: "text/plain" });
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setEngineState("error");
      setStatusMessage("Por favor, selecione um ficheiro primeiro.");
      return;
    }

    try {
      setEngineState("loading");
      setStatusMessage("A analisar formato do ficheiro...");

      setEngineState("processing");
      setStatusMessage(`A converter "${selectedFile.name}" para ${targetFormat}...`);

      const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || selectedFile.name;
      const targetExt = targetFormat.toLowerCase();
      const outputFileName = `${baseName}_converted.${targetExt}`;

      let resultBlob: Blob;

      if (selectedFile.type.startsWith("image/")) {
        resultBlob = await convertImage(selectedFile, targetFormat);
      } else {
        resultBlob = await convertTextDocument(selectedFile, targetFormat);
      }

      const blobUrl = URL.createObjectURL(resultBlob);
      setConvertedResult({
        blob: resultBlob,
        fileName: outputFileName,
        url: blobUrl,
      });

      setEngineState("done");
      setStatusMessage(`Conversão concluída! O ficheiro ${outputFileName} está pronto para download.`);
    } catch (err) {
      setEngineState("error");
      setStatusMessage(err instanceof Error ? err.message : "Erro durante a conversão do ficheiro.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🔄</span> Filee Engine
          </h2>
          <p className="text-sm text-slate-500">Conversão universal de ficheiros client-side no navegador</p>
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

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
          }
        }}
        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors mb-6"
      >
        <input
          type="file"
          id="convert-upload"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
          className="hidden"
        />
        <label htmlFor="convert-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-3">
            📁
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {selectedFile ? `Ficheiro: ${selectedFile.name}` : "Arraste e solte o seu ficheiro ou clique para selecionar"}
          </span>
          <span className="text-xs text-slate-400">Suporta imagens (PNG, JPG, WEBP) e documentos (TXT, JSON, CSV, HTML)</span>
        </label>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm font-medium text-slate-700">Converter para:</label>
        <select
          value={targetFormat}
          onChange={(e) => setTargetFormat(e.target.value)}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white font-medium text-slate-800"
        >
          <option value="PNG">PNG (Imagem)</option>
          <option value="JPG">JPG / JPEG (Imagem)</option>
          <option value="WEBP">WEBP (Imagem)</option>
          <option value="TXT">TXT (Texto Simples)</option>
          <option value="JSON">JSON (Dados Estruturados)</option>
          <option value="HTML">HTML (Documento Web)</option>
        </select>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-600 max-w-md">{statusMessage}</div>
        <div className="flex items-center gap-3">
          {convertedResult && (
            <a
              href={convertedResult.url}
              download={convertedResult.fileName}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors"
            >
              📥 Descarregar {convertedResult.fileName}
            </a>
          )}
          <Button onClick={handleConvert} disabled={engineState === "processing" || engineState === "loading"}>
            {engineState === "processing" ? "A converter..." : "Converter Ficheiro"}
          </Button>
        </div>
      </div>
    </div>
  );
}
