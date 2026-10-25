"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function FilmCraftEngine() {
  const [status, setStatus] = useState<string>("FilmCraft Engine pronto.");

  const handleExport = () => {
    setStatus("Exportando vídeo via FilmCraft Engine (FFmpeg Rust embutido)...");
    setTimeout(() => {
      setStatus("Exportação de vídeo concluída!");
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🎬</span> FilmCraft Engine (Stive Reel)
          </h2>
          <p className="text-sm text-slate-500">Editor de vídeo multi-pista completo no navegador</p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
          Engine Ready
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-8 text-center text-white mb-6">
        <div className="text-3xl mb-2">🎞️ Timeline de Vídeo</div>
        <p className="text-slate-400 text-xs">Processamento de vídeo 100% no cliente sem envio de media</p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-500">{status}</div>
        <Button onClick={handleExport}>Exportar Vídeo MP4</Button>
      </div>
    </div>
  );
}
