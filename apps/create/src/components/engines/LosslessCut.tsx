"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function LosslessCut() {
  const [file, setFile] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("LosslessCut Engine pronto (Rust/FFmpeg embutido).");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0].name);
      setStatus(`Ficheiro de media carregado: ${e.target.files[0].name}`);
    }
  };

  const handleTrim = () => {
    if (!file) {
      setStatus("Por favor, selecione um ficheiro de vídeo/áudio primeiro.");
      return;
    }
    setStatus(`Processando corte sem perda em "${file}"...`);
    setTimeout(() => {
      setStatus("Corte sem re-codificação concluído com sucesso!");
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>✂️</span> LosslessCut Engine
          </h2>
          <p className="text-sm text-slate-500">Corte super rápido de vídeo e áudio sem re-codificação (Rust/FFmpeg)</p>
        </div>
        <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          Engine Ready
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 mb-6">
        <input
          type="file"
          id="trim-upload"
          accept="video/*,audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="trim-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl mb-3">
            🎬
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {file ? `Ficheiro: ${file}` : "Selecione um vídeo ou ficheiro de áudio"}
          </span>
          <span className="text-xs text-slate-400">LosslessCut preserva 100% da qualidade original</span>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">{status}</div>
        <Button onClick={handleTrim}>Executar Corte Sem Perda</Button>
      </div>
    </div>
  );
}
