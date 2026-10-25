"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function VectorCraft() {
  const [elements, setElements] = useState<string[]>(["Retângulo", "Círculo", "Caminho"]);
  const [status, setStatus] = useState<string>("Motor VectorCraft pronto (Rust/WASM).");

  const handleAddShape = (shape: string) => {
    setElements((prev) => [...prev, shape]);
    setStatus(`Adicionado elemento vetorial: ${shape}`);
  };

  const handleExport = (format: string) => {
    setStatus(`Exportando desenho em formato ${format} usando VectorCraft Engine...`);
    setTimeout(() => {
      setStatus(`Exportação em ${format} concluída com sucesso!`);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🎨</span> VectorCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de ilustração e edição vetorial embutido (Rust/WASM)</p>
        </div>
        <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          Engine Ready
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 rounded-lg p-6 min-h-[300px] flex flex-col justify-between text-white">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span>Canvas Vetorial</span>
            <span>{elements.length} objetos</span>
          </div>

          <div className="my-auto flex flex-wrap gap-4 justify-center items-center py-8">
            {elements.map((el, i) => (
              <div key={i} className="px-4 py-2 bg-purple-900/60 border border-purple-500 rounded-md text-sm font-mono text-purple-200">
                {el} #{i + 1}
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-400 text-center border-t border-slate-800 pt-2">
            Processamento 100% Client-Side
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm">Ferramentas de Desenho</h3>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => handleAddShape("Retângulo")}>+ Adicionar Retângulo</Button>
            <Button variant="outline" onClick={() => handleAddShape("Círculo")}>+ Adicionar Círculo</Button>
            <Button variant="outline" onClick={() => handleAddShape("Texto Vetorial")}>+ Adicionar Texto</Button>
          </div>

          <h3 className="font-semibold text-slate-800 text-sm pt-2">Exportar</h3>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => handleExport("SVG")}>SVG</Button>
            <Button className="flex-1" onClick={() => handleExport("PDF")}>PDF</Button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-3">{status}</div>
    </div>
  );
}
