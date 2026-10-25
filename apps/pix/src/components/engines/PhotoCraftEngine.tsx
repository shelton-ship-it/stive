"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function PhotoCraftEngine() {
  const [status, setStatus] = useState<string>("PhotoCraft Engine pronto (Edição de imagem).");

  const handleAction = (act: string) => {
    setStatus(`Executando "${act}" via PhotoCraft Engine...`);
    setTimeout(() => {
      setStatus(`Ação "${act}" realizada com sucesso!`);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🖼️</span> PhotoCraft Engine (Stive Pix)
          </h2>
          <p className="text-sm text-slate-500">Editor rápido de imagem e fotografias online</p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
          Engine Ready
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button variant="outline" onClick={() => handleAction("Redimensionar Imagem")}>Redimensionar</Button>
        <Button variant="outline" onClick={() => handleAction("Cortar / Crop")}>Cortar</Button>
        <Button variant="outline" onClick={() => handleAction("Remover Fundo")}>Remover Fundo</Button>
      </div>

      <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">{status}</div>
    </div>
  );
}
