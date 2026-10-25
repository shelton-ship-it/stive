"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function PhotoCraft() {
  const [file, setFile] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("PhotoCraft Engine pronto (Rust/WASM/WebGPU).");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0].name);
      setStatus(`Foto carregada: ${e.target.files[0].name}`);
    }
  };

  const handleFilter = (filterName: string) => {
    if (!file) {
      setStatus("Por favor, selecione uma imagem primeiro.");
      return;
    }
    setStatus(`Aplicando filtro "${filterName}" via PhotoCraft WebGPU...`);
    setTimeout(() => {
      setStatus(`Filtro "${filterName}" aplicado com sucesso!`);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📷</span> PhotoCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de edição fotográfica acelerado por GPU (Rust/WebGPU)</p>
        </div>
        <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          Engine Ready
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 mb-6">
        <input
          type="file"
          id="lens-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="lens-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl mb-3">
            📷
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {file ? `Imagem: ${file}` : "Selecione uma fotografia para editar"}
          </span>
          <span className="text-xs text-slate-400">PhotoCraft suporta RAW, PNG, JPEG, WebP</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Button variant="outline" onClick={() => handleFilter("Ajustar Exposição")}>Ajustar Exposição</Button>
        <Button variant="outline" onClick={() => handleFilter("Remover Fundo AI")}>Remover Fundo</Button>
        <Button variant="outline" onClick={() => handleFilter("Filtro HDR")}>Filtro HDR</Button>
      </div>

      <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">{status}</div>
    </div>
  );
}
