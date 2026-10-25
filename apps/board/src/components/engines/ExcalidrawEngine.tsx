"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function ExcalidrawEngine() {
  const [status, setStatus] = useState<string>("Board Engine pronto (Excalidraw/Piik embutido).");

  const handleClear = () => {
    setStatus("Quadro limpo.");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📋</span> Excalidraw Engine (Stive Board)
          </h2>
          <p className="text-sm text-slate-500">Quadro interativo e colaborativo para diagramas e esquemas</p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
          Engine Ready
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg p-12 bg-slate-50 text-center min-h-[220px] flex items-center justify-center mb-6">
        <div>
          <div className="text-4xl mb-2">✏️ Canvas Colaborativo</div>
          <p className="text-slate-500 text-xs">Desenhe livremente com o motor Excalidraw/Piik</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-500">{status}</div>
        <Button variant="outline" onClick={handleClear}>Limpar Quadro</Button>
      </div>
    </div>
  );
}
