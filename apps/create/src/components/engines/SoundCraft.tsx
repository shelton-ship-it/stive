"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function SoundCraft() {
  const [status, setStatus] = useState<string>("SoundCraft Audio Engine pronto.");

  const handleAction = (action: string) => {
    setStatus(`Executando "${action}" via SoundCraft Engine...`);
    setTimeout(() => {
      setStatus(`Ação "${action}" concluída!`);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🎵</span> SoundCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Estação de trabalho e edição de áudio digital (DAW client-side)</p>
        </div>
        <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          Engine Ready
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-6 mb-6">
        <div className="text-xs text-slate-400 mb-2">Forma de Onda / Canais de Áudio</div>
        <div className="h-24 bg-purple-950/40 border border-purple-800/50 rounded flex items-center justify-center text-purple-300 font-mono text-xs">
          ||| |||| |||||| |||| ||||| ||||||| |||| |||||||
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Button variant="outline" onClick={() => handleAction("Limpeza de Ruído")}>Limpeza de Ruído AI</Button>
        <Button variant="outline" onClick={() => handleAction("Normalização")}>Normalizar Volume</Button>
        <Button variant="outline" onClick={() => handleAction("Efeitos de Reverb")}>Adicionar Reverb</Button>
      </div>

      <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">{status}</div>
    </div>
  );
}
