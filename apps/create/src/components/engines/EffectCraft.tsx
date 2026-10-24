"use client";

/**
 * UI Wrapper / Bridge for EffectCraft Engine Fork.
 * TODO: Ligar com o fork privado do EffectCraft (Rust embutido) em produção.
 */

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function EffectCraft({ mode = "motion" }: { mode?: "motion" | "3d" }) {
  const [fps, setFps] = useState<number>(60);
  const [keyframe, setKeyframe] = useState<number>(1);
  const [status, setStatus] = useState<string>("");

  const handleRender = () => {
    setStatus(`EffectCraft (Engine Fork): Renderizando composição ${mode === "3d" ? "3D" : "Motion"} a ${fps} FPS...`);
    setTimeout(() => {
      setStatus(`EffectCraft: Renderização concluída com sucesso!`);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>{mode === "3d" ? "🧊" : "🎬"}</span> EffectCraft Engine ({mode === "3d" ? "3D" : "Motion"})
          </h2>
          <p className="text-sm text-slate-500">
            {mode === "3d" ? "Visualizador e compositor 3D (Fork Privado Rust)" : "Animação e motion graphics (Fork Privado Rust)"}
          </p>
        </div>
        <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          Engine Ready
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className="md:col-span-8 bg-slate-950 rounded-xl p-8 border border-slate-800 flex flex-col items-center justify-center min-h-[260px] text-white">
          <div className="w-32 h-32 border-4 border-purple-500 rounded-2xl flex items-center justify-center font-bold text-2xl text-purple-300 animate-pulse">
            {mode === "3d" ? "3D Mesh" : "FX Curve"}
          </div>
          <span className="text-xs text-slate-400 mt-4">Keyframe Atual: #{keyframe} | GPU Viewport</span>
        </div>

        <div className="md:col-span-4 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Taxa de Frames (FPS)</label>
            <select
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
            >
              <option value={24}>24 FPS (Cinemático)</option>
              <option value={30}>30 FPS (Standard)</option>
              <option value={60}>60 FPS (Ultra Smooth)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keyframe ({keyframe})</label>
            <input
              type="range"
              min="1"
              max="120"
              value={keyframe}
              onChange={(e) => setKeyframe(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <Button onClick={handleRender} className="w-full">
            🎬 Renderizar Composição
          </Button>
        </div>
      </div>

      <div className="text-xs text-slate-500">{status || `EffectCraft Engine pronto para ${mode === "3d" ? "modelos 3D" : "motion graphics"}.`}</div>
    </div>
  );
}
