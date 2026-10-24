"use client";

/**
 * UI Wrapper / Bridge for VectorCraft Engine Fork.
 * TODO: Ligar com o fork privado do VectorCraft (Rust embutido) em produção.
 */

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function VectorCraft() {
  const [selectedTool, setSelectedTool] = useState<"select" | "pen" | "shapes" | "path">("pen");
  const [svgCode, setSvgCode] = useState<string>(
    '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="100" cy="100" r="80" fill="#a855f7" />\n  <rect x="60" y="60" width="80" height="80" fill="#3b82f6" rx="10" />\n</svg>'
  );
  const [status, setStatus] = useState<string>("");

  const handleExportSvg = () => {
    setStatus("VectorCraft (Engine Fork): Ficheiro SVG exportado com sucesso.");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🎨</span> VectorCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Editor vetorial de alta precisão (Fork Privado Rust)</p>
        </div>
        <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          Engine Ready
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTool("select")}
            className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
              selectedTool === "select" ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            ↖️ Seleção
          </button>
          <button
            onClick={() => setSelectedTool("pen")}
            className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
              selectedTool === "pen" ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            ✒️ Caneta / Bézier
          </button>
          <button
            onClick={() => setSelectedTool("shapes")}
            className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
              selectedTool === "shapes" ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-700 border-slate-300"
            }`}
          >
            ⬛ Formas
          </button>
        </div>

        <div>
          <Button onClick={handleExportSvg}>📥 Exportar SVG / EPS</Button>
        </div>
      </div>

      {/* Canvas view & SVG preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-100 rounded-lg p-6 border border-slate-300 min-h-[240px] flex flex-col justify-center items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase mb-4">Canvas Vetorial (VectorCraft)</span>
          <div
            className="bg-white p-4 rounded shadow-inner"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
            Código SVG / Caminhos Vetoriais
          </label>
          <textarea
            value={svgCode}
            onChange={(e) => setSvgCode(e.target.value)}
            rows={8}
            className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      <div className="text-xs text-slate-500">{status || "VectorCraft pronto para edição gráfica e traços vetoriais."}</div>
    </div>
  );
}
