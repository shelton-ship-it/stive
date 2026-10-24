"use client";

/**
 * UI Wrapper / Bridge for GenOffice Engine Fork.
 * TODO: Ligar com a API/módulo do fork privado do GenOffice em produção.
 */

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function GenOffice() {
  const [documentContent, setDocumentContent] = useState<string>(
    "Bem-vindo ao Stive Write. Comece a redigir o seu documento DOCX aqui..."
  );
  const [docTitle, setDocTitle] = useState<string>("Documento Sem Título");
  const [status, setStatus] = useState<string>("");

  const handleCreateNew = () => {
    setDocTitle("Novo Documento DOCX");
    setDocumentContent("");
    setStatus("GenOffice: Novo documento DOCX criado.");
  };

  const handleExport = (format: "docx" | "pdf") => {
    setStatus(`GenOffice (Engine Fork): Exportando "${docTitle}" em formato .${format}...`);
    setTimeout(() => {
      setStatus(`GenOffice: Documento exportado em .${format} com sucesso!`);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>✏️</span> GenOffice Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de processamento de documentos DOCX (Fork Privado)</p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
          Engine Ready
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            placeholder="Nome do documento"
          />
          <span className="text-xs text-slate-400 font-mono">.docx</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNew}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors"
          >
            ➕ Criar
          </button>
          <button
            onClick={() => setStatus("GenOffice: Documento guardado no editor.")}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors"
          >
            ✏️ Editar
          </button>
          <Button onClick={() => handleExport("docx")}>
            📥 Exportar DOCX
          </Button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded hover:bg-slate-900 transition-colors"
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
          Editor DOCX em Tempo Real (GenOffice)
        </label>
        <textarea
          value={documentContent}
          onChange={(e) => setDocumentContent(e.target.value)}
          rows={12}
          className="w-full p-4 border border-slate-300 rounded-lg shadow-inner font-serif text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none leading-relaxed"
          placeholder="Comece a escrever o seu documento..."
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>{status || "Pronto para redação e edição de ficheiros DOCX."}</div>
        <div>
          Palavras: {documentContent.trim() ? documentContent.trim().split(/\s+/).length : 0} | Caracteres: {documentContent.length}
        </div>
      </div>
    </div>
  );
}
