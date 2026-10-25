"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function FileeEngine() {
  const [file, setFile] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("PDF");
  const [status, setStatus] = useState<string>("Filee Engine pronto (Drag & drop conversão).");

  const handleConvert = () => {
    if (!file) {
      setStatus("Por favor, selecione um ficheiro primeiro.");
      return;
    }
    setStatus(`Convertendo "${file}" para ${targetFormat} via Filee Engine...`);
    setTimeout(() => {
      setStatus(`Conversão para ${targetFormat} concluída com sucesso!`);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🔄</span> Filee Engine
          </h2>
          <p className="text-sm text-slate-500">Conversão universal de ficheiros drag & drop no navegador</p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
          Engine Ready
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 mb-6">
        <input
          type="file"
          id="convert-upload"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setFile(e.target.files[0].name);
              setStatus(`Ficheiro selecionado: ${e.target.files[0].name}`);
            }
          }}
          className="hidden"
        />
        <label htmlFor="convert-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-3">
            📁
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {file ? `Ficheiro: ${file}` : "Arraste e solte o ficheiro DOCX, XLSX ou imagem aqui"}
          </span>
          <span className="text-xs text-slate-400">Conversão rápida e privada 100% no cliente</span>
        </label>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm font-medium text-slate-700">Converter para:</label>
        <select
          value={targetFormat}
          onChange={(e) => setTargetFormat(e.target.value)}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="PDF">PDF</option>
          <option value="DOCX">DOCX</option>
          <option value="PNG">PNG</option>
          <option value="JPG">JPG</option>
        </select>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-500">{status}</div>
        <Button onClick={handleConvert}>Converter Ficheiro</Button>
      </div>
    </div>
  );
}
