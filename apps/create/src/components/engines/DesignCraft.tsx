"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function DesignCraft() {
  const [status, setStatus] = useState<string>("DesignCraft Layout Engine pronto.");

  const handleExport = (format: string) => {
    setStatus(`Exportando publicação em ${format} via DesignCraft Engine...`);
    setTimeout(() => {
      setStatus(`Exportação em ${format} concluída!`);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📐</span> DesignCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de editoração eletrônica e diagramação gráfica</p>
        </div>
        <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          Engine Ready
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-center">
          <div className="text-2xl mb-1">📖</div>
          <div className="text-sm font-semibold text-slate-800">Layout Multi-página</div>
          <div className="text-xs text-slate-500 mt-1">Diagramação de revistas, brochuras e relatórios</div>
        </div>
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-center">
          <div className="text-2xl mb-1">🪧</div>
          <div className="text-sm font-semibold text-slate-800">Posters & Flyers</div>
          <div className="text-xs text-slate-500 mt-1">Formatos de impressão de alta resolução</div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-500">{status}</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("PDF/X")}>Exportar PDF/X</Button>
          <Button onClick={() => handleExport("PNG HD")}>Exportar PNG HD</Button>
        </div>
      </div>
    </div>
  );
}
