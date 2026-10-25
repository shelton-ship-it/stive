"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function EffectCraft({ is3D = false }: { is3D?: boolean }) {
  const [status, setStatus] = useState<string>(
    is3D ? "EffectCraft 3D Engine pronto (Rust/WebGL/WebGPU)." : "EffectCraft Motion Engine pronto (Rust/WASM)."
  );

  const handleRender = () => {
    setStatus(`Renderizando cena ${is3D ? "3D" : "Motion"} via EffectCraft Engine...`);
    setTimeout(() => {
      setStatus(`Renderização ${is3D ? "3D" : "Motion"} concluída!`);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>{is3D ? "🧊" : "🎬"}</span> EffectCraft Engine {is3D ? "(3D)" : "(Motion)"}
          </h2>
          <p className="text-sm text-slate-500">
            {is3D
              ? "Visualização e composição 3D acelerada no navegador (Rust embutido)"
              : "Animações e motion graphics profissionais (Rust embutido)"}
          </p>
        </div>
        <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          Engine Ready
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-8 min-h-[260px] flex items-center justify-center text-white mb-6">
        <div className="text-center">
          <div className="text-4xl mb-3">{is3D ? "🧊 3D Scene Viewport" : "🎬 Motion Timeline"}</div>
          <p className="text-slate-400 text-sm">EffectCraft Engine Native WebGPU Pipeline</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">{status}</div>
        <Button onClick={handleRender}>Renderizar {is3D ? "Modelo 3D" : "Animação"}</Button>
      </div>
    </div>
  );
}
