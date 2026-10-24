"use client";

/**
 * UI Wrapper / Bridge for PDFCraft Engine Fork.
 * TODO: Ligar com a API/módulo binário do fork privado do PDFCraft em produção.
 */

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function PDFCraft() {
  const [activeTab, setActiveTab] = useState<"merge" | "split" | "compress" | "sign">("merge");
  const [files, setFiles] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setFiles(names);
      setStatus(`Carregado(s) ${names.length} ficheiro(s) PDF.`);
    }
  };

  const handleAction = (actionName: string) => {
    if (files.length === 0) {
      setStatus(`Por favor, selecione pelo menos um ficheiro PDF para ${actionName}.`);
      return;
    }
    setStatus(`PDFCraft (Engine Fork): Executando operação "${actionName}" em ${files.join(", ")}...`);
    setTimeout(() => {
      setStatus(`PDFCraft: Operação "${actionName}" concluída com sucesso!`);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📄</span> PDFCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de processamento de documentos PDF (Fork Privado)</p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
          Engine Ready
        </div>
      </div>

      {/* Actions Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setActiveTab("merge")}
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
          onClick={() => setActiveTab("split")}
          className={`p-3 rounded-lg border text-left font-medium transition-all ${
            activeTab === "split"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="text-base mb-1">✂️ Dividir</div>
          <div className="text-xs text-slate-500 font-normal">Extrair páginas ou dividir PDF</div>
        </button>

        <button
          onClick={() => setActiveTab("compress")}
          className={`p-3 rounded-lg border text-left font-medium transition-all ${
            activeTab === "compress"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="text-base mb-1">🗜️ Comprimir</div>
          <div className="text-xs text-slate-500 font-normal">Reduzir tamanho sem perder qualidade</div>
        </button>

        <button
          onClick={() => setActiveTab("sign")}
          className={`p-3 rounded-lg border text-left font-medium transition-all ${
            activeTab === "sign"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="text-base mb-1">✍️ Assinar</div>
          <div className="text-xs text-slate-500 font-normal">Assinatura digital e rubricar</div>
        </button>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors mb-6">
        <input
          type="file"
          id="pdf-upload"
          accept=".pdf"
          multiple={activeTab === "merge"}
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-3">
            📁
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            Selecione ficheiro(s) PDF ou arraste para aqui
          </span>
          <span className="text-xs text-slate-400">PDFCraft Engine suporta até 100MB</span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mb-6 p-3 bg-slate-100 rounded text-xs text-slate-700">
          <strong>Ficheiros selecionados:</strong> {files.join(", ")}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">{status}</div>
        <div>
          {activeTab === "merge" && (
            <Button onClick={() => handleAction("Juntar PDFs")}>Juntar PDFs</Button>
          )}
          {activeTab === "split" && (
            <Button onClick={() => handleAction("Dividir PDF")}>Dividir PDF</Button>
          )}
          {activeTab === "compress" && (
            <Button onClick={() => handleAction("Comprimir PDF")}>Comprimir PDF</Button>
          )}
          {activeTab === "sign" && (
            <Button onClick={() => handleAction("Assinar PDF")}>Assinar PDF</Button>
          )}
        </div>
      </div>
    </div>
  );
}
