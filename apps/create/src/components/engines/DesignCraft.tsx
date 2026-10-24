"use client";

/**
 * UI Wrapper / Bridge for DesignCraft Engine Fork.
 * TODO: Ligar com o fork privado do DesignCraft (editoração e paginação) em produção.
 */

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function DesignCraft() {
  const [pageSize, setPageSize] = useState<string>("A4");
  const [columns, setColumns] = useState<number>(3);
  const [status, setStatus] = useState<string>("");

  const handleExportPdf = () => {
    setStatus(`DesignCraft (Engine Fork): Layout exportado em PDF de alta resolução (${pageSize}, ${columns} colunas).`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📐</span> DesignCraft Engine (Layout)
          </h2>
          <p className="text-sm text-slate-500">Editoração gráfica e paginação para publicações e impressos (Fork Privado)</p>
        </div>
        <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          Engine Ready
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        {/* Settings */}
        <div className="md:col-span-4 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Formato de Página</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
            >
              <option value="A4">A4 (210 x 297 mm)</option>
              <option value="A5">A5 (148 x 210 mm)</option>
              <option value="Letter">Letter (8.5 x 11 in)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Número de Colunas ({columns})</label>
            <input
              type="range"
              min="1"
              max="5"
              value={columns}
              onChange={(e) => setColumns(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <Button onClick={handleExportPdf} className="w-full">
            📥 Exportar PDF / Print
          </Button>
        </div>

        {/* Layout Preview */}
        <div className="md:col-span-8 bg-slate-200 rounded-lg p-6 flex flex-col justify-center items-center min-h-[260px]">
          <div className="bg-white shadow-xl p-6 rounded w-64 h-80 flex flex-col justify-between border border-slate-300">
            <div className="h-6 bg-purple-600 rounded w-3/4 mb-3" />
            <div className="grid gap-2 flex-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, i) => (
                <div key={i} className="bg-slate-100 rounded p-1 space-y-1 border border-slate-200">
                  <div className="h-2 bg-slate-300 rounded w-full" />
                  <div className="h-2 bg-slate-200 rounded w-5/6" />
                  <div className="h-2 bg-slate-200 rounded w-4/6" />
                  <div className="h-2 bg-slate-200 rounded w-full" />
                </div>
              ))}
            </div>
            <div className="h-2 bg-slate-300 rounded w-1/4 mt-3" />
          </div>
          <span className="text-xs text-slate-500 mt-3 font-mono">Grelha de Paginação ({pageSize} — {columns} Colunas)</span>
        </div>
      </div>

      <div className="text-xs text-slate-500">{status || "DesignCraft Engine pronto para diagramação de brochuras e revistas."}</div>
    </div>
  );
}
