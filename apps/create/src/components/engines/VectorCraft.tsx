"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@stive/ui";

export interface VectorShape {
  id: string;
  type: "rect" | "circle" | "text" | "star";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text?: string;
}

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function VectorCraft() {
  const [shapes, setShapes] = useState<VectorShape[]>([
    { id: "1", type: "rect", x: 40, y: 40, width: 120, height: 80, fill: "#8b5cf6", stroke: "#7c3aed", strokeWidth: 2 },
    { id: "2", type: "circle", x: 220, y: 80, width: 90, height: 90, fill: "#ec4899", stroke: "#db2777", strokeWidth: 2 },
    { id: "3", type: "text", x: 60, y: 180, width: 200, height: 40, fill: "#ffffff", stroke: "none", strokeWidth: 0, text: "VectorCraft SVG" },
  ]);

  const [selectedShapeId, setSelectedShapeId] = useState<string>("1");
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("VectorCraft Engine pronto.");
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  const selectedShape = useMemo(
    () => shapes.find((s) => s.id === selectedShapeId) || shapes[0],
    [shapes, selectedShapeId]
  );

  const handleAddShape = (type: "rect" | "circle" | "text" | "star") => {
    const id = Math.random().toString(36).substring(2, 9);
    const newShape: VectorShape = {
      id,
      type,
      x: Math.floor(Math.random() * 200) + 30,
      y: Math.floor(Math.random() * 120) + 30,
      width: type === "circle" ? 80 : 100,
      height: type === "circle" ? 80 : 60,
      fill: type === "star" ? "#f59e0b" : type === "text" ? "#38bdf8" : "#10b981",
      stroke: "#ffffff",
      strokeWidth: 2,
      text: type === "text" ? "Texto Vetorial" : undefined,
    };

    setShapes((prev) => [...prev, newShape]);
    setSelectedShapeId(id);
    setEngineState("done");
    setStatus(`Adicionado elemento vetorial: ${type}`);
  };

  const handleUpdateSelected = (field: keyof VectorShape, val: unknown) => {
    if (!selectedShape) return;
    setShapes((prev) =>
      prev.map((s) => (s.id === selectedShape.id ? { ...s, [field]: val } : s))
    );
  };

  const handleDeleteSelected = () => {
    if (shapes.length <= 1) {
      setEngineState("error");
      setStatus("O desenho deve ter pelo menos um elemento.");
      return;
    }
    const filtered = shapes.filter((s) => s.id !== selectedShapeId);
    setShapes(filtered);
    if (filtered[0]) setSelectedShapeId(filtered[0].id);
    setEngineState("done");
    setStatus("Elemento removido.");
  };

  const generateSVGString = (): string => {
    const elementsSVG = shapes
      .map((s) => {
        if (s.type === "rect") {
          return `<rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}" rx="6" />`;
        }
        if (s.type === "circle") {
          const r = s.width / 2;
          return `<circle cx="${s.x + r}" cy="${s.y + r}" r="${r}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}" />`;
        }
        if (s.type === "star") {
          const cx = s.x + s.width / 2;
          const cy = s.y + s.height / 2;
          const r = s.width / 2;
          const points = [
            `${cx},${cy - r}`,
            `${cx + r * 0.3},${cy - r * 0.3}`,
            `${cx + r},${cy - r * 0.2}`,
            `${cx + r * 0.5},${cy + r * 0.3}`,
            `${cx + r * 0.7},${cy + r}`,
            `${cx},${cy + r * 0.6}`,
            `${cx - r * 0.7},${cy + r}`,
            `${cx - r * 0.5},${cy + r * 0.3}`,
            `${cx - r},${cy - r * 0.2}`,
            `${cx - r * 0.3},${cy - r * 0.3}`,
          ].join(" ");
          return `<polygon points="${points}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}" />`;
        }
        if (s.type === "text") {
          return `<text x="${s.x}" y="${s.y + 24}" fill="${s.fill}" font-family="sans-serif" font-size="20" font-weight="bold">${s.text || "Texto"}</text>`;
        }
        return "";
      })
      .join("\n  ");

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="500" height="300" style="background-color: #0f172a;">\n  ${elementsSVG}\n</svg>`;
  };

  const handleExport = async (format: "SVG" | "PNG") => {
    try {
      setEngineState("processing");
      setStatus(`Exportando desenho vetorial em ${format}...`);

      const svgString = generateSVGString();

      if (format === "SVG") {
        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        setExportedFile({ url, fileName: "stive_vector_graphic.svg" });
      } else {
        // PNG export via Canvas
        const blob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(svgBlob);

          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 1000;
            canvas.height = 600;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              URL.revokeObjectURL(url);
              return reject(new Error("Não foi possível criar contexto Canvas."));
            }
            ctx.drawImage(img, 0, 0, 1000, 600);
            canvas.toBlob((b) => {
              URL.revokeObjectURL(url);
              if (b) resolve(b);
              else reject(new Error("Erro ao gerar PNG."));
            }, "image/png");
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Erro ao carregar imagem SVG."));
          };
          img.src = url;
        });

        const url = URL.createObjectURL(blob);
        setExportedFile({ url, fileName: "stive_vector_graphic.png" });
      }

      setEngineState("done");
      setStatus(`Exportação em ${format} concluída com sucesso!`);
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : `Erro na exportação ${format}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🎨</span> VectorCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de ilustração e edição de gráficos vetoriais (SVG/PNG)</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              engineState === "done"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : engineState === "error"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : engineState === "processing"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-purple-50 text-purple-700 border-purple-200"
            }`}
          >
            {engineState.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Live SVG Viewport */}
        <div className="md:col-span-2 bg-slate-900 rounded-lg p-4 min-h-[320px] flex flex-col justify-between text-white border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-2">
            <span>Canvas Vetorial SVG (500x300)</span>
            <span>{shapes.length} objetos</span>
          </div>

          <div className="my-auto flex justify-center items-center overflow-hidden">
            <div
              className="border border-slate-700 rounded shadow-2xl bg-slate-950"
              dangerouslySetInnerHTML={{ __html: generateSVGString() }}
            />
          </div>

          <div className="text-xs text-slate-400 text-center border-t border-slate-800 pt-2 mt-2">
            Renderização vetorial 100% Client-Side
          </div>
        </div>

        {/* Tools and Inspector */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm">Ferramentas de Desenho</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => handleAddShape("rect")}>+ Retângulo</Button>
            <Button variant="outline" onClick={() => handleAddShape("circle")}>+ Círculo</Button>
            <Button variant="outline" onClick={() => handleAddShape("star")}>+ Estrela</Button>
            <Button variant="outline" onClick={() => handleAddShape("text")}>+ Texto</Button>
          </div>

          {selectedShape && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Elemento: {selectedShape.type}
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Remover
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Cor de Preenchimento:</label>
                  <input
                    type="color"
                    value={selectedShape.fill}
                    onChange={(e) => handleUpdateSelected("fill", e.target.value)}
                    className="w-full h-8 rounded border cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Cor do Contorno:</label>
                  <input
                    type="color"
                    value={selectedShape.stroke}
                    onChange={(e) => handleUpdateSelected("stroke", e.target.value)}
                    className="w-full h-8 rounded border cursor-pointer"
                  />
                </div>
              </div>

              {selectedShape.type === "text" && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Texto:</label>
                  <input
                    type="text"
                    value={selectedShape.text || ""}
                    onChange={(e) => handleUpdateSelected("text", e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                  />
                </div>
              )}
            </div>
          )}

          <h3 className="font-semibold text-slate-800 text-sm pt-2">Exportar</h3>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => handleExport("SVG")}>SVG</Button>
            <Button className="flex-1" onClick={() => handleExport("PNG")}>PNG</Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-3">
        <div>{status}</div>
        {exportedFile && (
          <a
            href={exportedFile.url}
            download={exportedFile.fileName}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded shadow-sm transition-colors"
          >
            📥 Descarregar {exportedFile.fileName}
          </a>
        )}
      </div>
    </div>
  );
}
