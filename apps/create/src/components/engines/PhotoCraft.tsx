"use client";

/**
 * UI Wrapper / Bridge for PhotoCraft Engine Fork.
 * TODO: Ligar com o fork privado do PhotoCraft (Rust/WASM/WebGPU) em produção.
 */

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function PhotoCraft() {
  const [filter, setFilter] = useState<string>("none");
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [status, setStatus] = useState<string>("");

  const handleApply = () => {
    setStatus(`PhotoCraft (Engine Fork): Filtros aplicados (${filter}, brilho: ${brightness}%, contraste: ${contrast}%).`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📷</span> PhotoCraft Engine (Lens)
          </h2>
          <p className="text-sm text-slate-500">Biblioteca e processador fotográfico acelerado por GPU (Fork Privado)</p>
        </div>
        <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          Engine Ready
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        {/* Controls */}
        <div className="md:col-span-5 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filtro de Fotografia</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
            >
              <option value="none">Normal / Sem filtro</option>
              <option value="grayscale">Preto e Branco</option>
              <option value="sepia">Sépia Clássico</option>
              <option value="vivid">Vivid Color</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Brilho ({brightness}%)</label>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Contraste ({contrast}%)</label>
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <Button onClick={handleApply} className="w-full">
            Aplicar Ajustes
          </Button>
        </div>

        {/* Live Preview */}
        <div className="md:col-span-7 bg-slate-900 rounded-lg p-6 flex flex-col justify-center items-center text-white min-h-[240px]">
          <div
            className="w-48 h-32 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-lg flex items-center justify-center font-bold text-lg"
            style={{
              filter: `${filter === "grayscale" ? "grayscale(100%)" : filter === "sepia" ? "sepia(100%)" : "none"} brightness(${brightness}%) contrast(${contrast}%)`,
            }}
          >
            PhotoCraft GPU
          </div>
          <span className="text-xs text-slate-400 mt-4">Previsualização em Tempo Real</span>
        </div>
      </div>

      <div className="text-xs text-slate-500">{status || "PhotoCraft Engine pronto para edição fotográfica."}</div>
    </div>
  );
}
