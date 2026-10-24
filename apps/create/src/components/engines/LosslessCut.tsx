"use client";

/**
 * UI Wrapper / Bridge for LosslessCut Engine Fork.
 * TODO: Ligar com o fork privado do LosslessCut (Rust/FFmpeg embutido) em produção.
 */

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function LosslessCut() {
  const [startTime, setStartTime] = useState<string>("00:00:05");
  const [endTime, setEndTime] = useState<string>("00:01:30");
  const [fileName, setFileName] = useState<string>("video_clipe.mp4");
  const [status, setStatus] = useState<string>("");

  const handleCut = () => {
    setStatus(`LosslessCut (Engine Fork): Cortando "${fileName}" de ${startTime} até ${endTime} sem re-codificação...`);
    setTimeout(() => {
      setStatus(`LosslessCut: Corte concluído sem perda de qualidade! Ficheiro pronto.`);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>✂️</span> LosslessCut Engine (Trim)
          </h2>
          <p className="text-sm text-slate-500">Corte ultrarrápido de vídeo e áudio sem perda de qualidade (Fork Privado FFmpeg/Rust)</p>
        </div>
        <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          Engine Ready
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-slate-700">Ficheiro selecionado: {fileName}</span>
          <button
            onClick={() => setFileName("novo_clipe_hd.mp4")}
            className="text-xs text-purple-600 font-medium hover:underline"
          >
            Alterar Ficheiro
          </button>
        </div>

        {/* Timeline representation */}
        <div className="relative w-full h-12 bg-slate-200 rounded-lg overflow-hidden flex items-center mb-6">
          <div className="absolute left-[10%] right-[30%] top-0 bottom-0 bg-purple-500/30 border-l-2 border-r-2 border-purple-600 flex items-center justify-center text-xs font-bold text-purple-900">
            Zona de Corte
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Ponto Início (In)</label>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Ponto Fim (Out)</label>
            <input
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-sm font-mono"
            />
          </div>
        </div>

        <Button onClick={handleCut} className="w-full">
          ✂️ Executar Corte Lossless
        </Button>
      </div>

      <div className="text-xs text-slate-500">{status || "LosslessCut pronto para cortes diretos de stream de vídeo/áudio."}</div>
    </div>
  );
}
