"use client";

/**
 * UI Wrapper / Bridge for SoundCraft Engine Fork.
 * TODO: Ligar com o fork privado do SoundCraft (áudio digital/DSP) em produção.
 */

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function SoundCraft() {
  const [bpm, setBpm] = useState<number>(120);
  const [tracks, setTracks] = useState<string[]>(["Voz Principal", "Guitarra Base", "Sintetizador", "Bateria"]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    setStatus(!isPlaying ? `SoundCraft (Engine Fork): Reproduzindo ${tracks.length} faixas a ${bpm} BPM...` : "SoundCraft: Reprodução pausada.");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🎵</span> SoundCraft Engine (Audio)
          </h2>
          <p className="text-sm text-slate-500">Estação de trabalho de áudio digital (DAW) e mistura (Fork Privado)</p>
        </div>
        <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          Engine Ready
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-4">
          <Button onClick={handleTogglePlay}>
            {isPlaying ? "⏸️ Pausar" : "▶️ Reproduzir Multi-track"}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Tempo:</span>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-16 p-1 border border-slate-300 rounded text-xs font-mono text-center"
            />
            <span className="text-xs text-slate-400">BPM</span>
          </div>
        </div>

        <button
          onClick={() => setTracks([...tracks, `Faixa ${tracks.length + 1}`])}
          className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors"
        >
          ➕ Adicionar Faixa
        </button>
      </div>

      {/* Tracks Mixer View */}
      <div className="space-y-3 mb-6">
        {tracks.map((track, idx) => (
          <div key={idx} className="bg-slate-900 text-white p-3 rounded-lg flex items-center justify-between border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-6 text-xs text-purple-400 font-mono">#{idx + 1}</span>
              <span className="font-medium text-sm">{track}</span>
            </div>

            {/* Simulated waveform */}
            <div className="hidden sm:flex items-center gap-1 flex-1 mx-6 h-6 bg-slate-950 p-1 rounded overflow-hidden">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-purple-500/70 rounded-full"
                  style={{ height: `${(Math.sin(i + idx) * 0.5 + 0.5) * 100}%` }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded hover:bg-slate-700">Mute</button>
              <button className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded hover:bg-slate-700">Solo</button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-slate-500">{status || "SoundCraft Engine pronto para gravação e mistura multipista."}</div>
    </div>
  );
}
