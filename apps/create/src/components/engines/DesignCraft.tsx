// BLOQUEADO: packages/engines/designcraft é uma aplicação Rust/Cargo sem entrypoint JS exportado.
"use client";

import React, { useState, useRef } from "react";
import { Button } from "@stive/ui";

interface LayoutElement {
  id: string;
  type: "heading" | "body" | "banner" | "badge";
  text: string;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
}

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function DesignCraft() {
  const [preset, setPreset] = useState<"flyer" | "poster" | "brochure">("flyer");
  const [elements, setElements] = useState<LayoutElement[]>([
    { id: "1", type: "banner", text: "NOVO LANÇAMENTO", bgColor: "#4c1d95", textColor: "#ffffff" },
    { id: "2", type: "heading", text: "Stive DesignCraft 2025", fontSize: 24, textColor: "#1e293b" },
    { id: "3", type: "body", text: "Plataforma completa de design gráfico e editoração digital integrada.", fontSize: 14, textColor: "#475569" },
    { id: "4", type: "badge", text: "EDIÇÃO ESPECIAL", bgColor: "#059669", textColor: "#ffffff" },
  ]);

  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("DesignCraft Engine pronto.");
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleAddElement = (type: "heading" | "body" | "banner" | "badge") => {
    const newEl: LayoutElement = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      text: type === "heading" ? "Novo Título" : type === "body" ? "Novo texto de parágrafo..." : "ETIQUETA",
      bgColor: type === "banner" ? "#2563eb" : type === "badge" ? "#d97706" : undefined,
      textColor: type === "banner" || type === "badge" ? "#ffffff" : "#1e293b",
      fontSize: type === "heading" ? 22 : 14,
    };
    setElements([...elements, newEl]);
    setEngineState("done");
    setStatus(`Adicionado elemento ${type} ao layout.`);
  };

  const handleUpdateElement = (id: string, field: keyof LayoutElement, val: unknown) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, [field]: val } : el)));
  };

  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setEngineState("done");
    setStatus("Elemento removido.");
  };

  const renderLayoutToCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions based on preset
    const w = preset === "poster" ? 600 : preset === "brochure" ? 800 : 500;
    const h = preset === "poster" ? 800 : preset === "brochure" ? 500 : 700;

    canvas.width = w;
    canvas.height = h;

    // Background & Margins
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Outer border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    let currentY = 40;

    elements.forEach((el) => {
      if (el.type === "banner") {
        ctx.fillStyle = el.bgColor || "#4c1d95";
        ctx.fillRect(20, currentY, w - 40, 48);

        ctx.fillStyle = el.textColor || "#ffffff";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(el.text.toUpperCase(), w / 2, currentY + 30);

        currentY += 68;
      } else if (el.type === "heading") {
        ctx.fillStyle = el.textColor || "#0f172a";
        ctx.font = `bold ${el.fontSize || 24}px sans-serif`;
        ctx.textAlign = "left";
        ctx.fillText(el.text, 30, currentY + 24);

        currentY += (el.fontSize || 24) + 20;
      } else if (el.type === "body") {
        ctx.fillStyle = el.textColor || "#334155";
        ctx.font = `${el.fontSize || 14}px sans-serif`;
        ctx.textAlign = "left";

        // Word wrap simple
        const words = el.text.split(" ");
        let line = "";
        const maxWidth = w - 60;

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, 30, currentY + 16);
            line = words[i] + " ";
            currentY += 22;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 30, currentY + 16);
        currentY += 36;
      } else if (el.type === "badge") {
        ctx.fillStyle = el.bgColor || "#059669";
        const badgeWidth = Math.min(200, ctx.measureText(el.text).width + 30);
        ctx.fillRect(30, currentY, badgeWidth, 30);

        ctx.fillStyle = el.textColor || "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(el.text.toUpperCase(), 30 + badgeWidth / 2, currentY + 19);

        currentY += 46;
      }
    });
  };

  const handleExport = (format: "PNG" | "PDF") => {
    try {
      setEngineState("processing");
      setStatus(`Exportando publicação em ${format} via DesignCraft Engine...`);

      const canvas = document.createElement("canvas");
      renderLayoutToCanvas(canvas);

      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Falha ao gerar o layout de publicação.");
        const url = URL.createObjectURL(blob);
        const ext = format === "PDF" ? "pdf" : "png";
        const fileName = `stive_designcraft_${preset}.${ext}`;

        setExportedFile({ url, fileName });
        setEngineState("done");
        setStatus(`Exportação em ${format} (${fileName}) concluída com sucesso!`);
      }, format === "PDF" ? "application/pdf" : "image/png");
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : `Erro ao exportar ${format}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📐</span> DesignCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de editoração eletrônica e diagramação gráfica (Layout Publishing)</p>
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

      {/* Preset Selector */}
      <div className="flex items-center gap-4 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <span className="text-xs font-bold text-slate-700 uppercase">Formato de Formatação:</span>
        <button
          onClick={() => setPreset("flyer")}
          className={`px-3 py-1 text-xs font-semibold rounded border ${
            preset === "flyer" ? "bg-purple-600 text-white" : "bg-white text-slate-700"
          }`}
        >
          🪧 Flyer (500x700)
        </button>
        <button
          onClick={() => setPreset("poster")}
          className={`px-3 py-1 text-xs font-semibold rounded border ${
            preset === "poster" ? "bg-purple-600 text-white" : "bg-white text-slate-700"
          }`}
        >
          🖼️ Poster (600x800)
        </button>
        <button
          onClick={() => setPreset("brochure")}
          className={`px-3 py-1 text-xs font-semibold rounded border ${
            preset === "brochure" ? "bg-purple-600 text-white" : "bg-white text-slate-700"
          }`}
        >
          📖 Brochura (800x500)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Document Visualizer */}
        <div className="md:col-span-2 bg-slate-100 rounded-lg p-6 border border-slate-200 min-h-[380px] flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Previsualização de Layout Diagramado
          </div>

          <div className="space-y-3 bg-white p-6 rounded shadow-sm border border-slate-300 min-h-[280px]">
            {elements.map((el) => (
              <div key={el.id} className="relative group">
                {el.type === "banner" && (
                  <div
                    style={{ backgroundColor: el.bgColor || "#4c1d95", color: el.textColor || "#ffffff" }}
                    className="p-3 text-center font-bold text-sm tracking-wider uppercase rounded shadow-sm"
                  >
                    {el.text}
                  </div>
                )}
                {el.type === "heading" && (
                  <div
                    style={{ fontSize: `${el.fontSize || 24}px`, color: el.textColor || "#0f172a" }}
                    className="font-bold py-1"
                  >
                    {el.text}
                  </div>
                )}
                {el.type === "body" && (
                  <div
                    style={{ fontSize: `${el.fontSize || 14}px`, color: el.textColor || "#334155" }}
                    className="leading-relaxed py-1"
                  >
                    {el.text}
                  </div>
                )}
                {el.type === "badge" && (
                  <span
                    style={{ backgroundColor: el.bgColor || "#059669", color: el.textColor || "#ffffff" }}
                    className="inline-block px-3 py-1 font-bold text-xs uppercase tracking-wide rounded"
                  >
                    {el.text}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-400 text-right mt-2 font-mono">
            {elements.length} blocos de layout ativos
          </div>
        </div>

        {/* Layout Tools */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm">Adicionar Bloco</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => handleAddElement("heading")}>+ Título</Button>
            <Button variant="outline" onClick={() => handleAddElement("body")}>+ Parágrafo</Button>
            <Button variant="outline" onClick={() => handleAddElement("banner")}>+ Faixa</Button>
            <Button variant="outline" onClick={() => handleAddElement("badge")}>+ Etiqueta</Button>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-[220px] overflow-y-auto space-y-3 text-xs">
            <span className="font-bold text-slate-700 uppercase block">Editar Elementos</span>
            {elements.map((el, i) => (
              <div key={el.id} className="flex items-center justify-between border-b border-slate-200 pb-2">
                <input
                  type="text"
                  value={el.text}
                  onChange={(e) => handleUpdateElement(el.id, "text", e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded text-xs w-full mr-2"
                />
                <button
                  onClick={() => handleDeleteElement(el.id)}
                  className="text-rose-600 font-bold hover:underline"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-500">{status}</div>
        <div className="flex items-center gap-2">
          {exportedFile && (
            <a
              href={exportedFile.url}
              download={exportedFile.fileName}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded shadow-sm transition-colors"
            >
              📥 Descarregar {exportedFile.fileName}
            </a>
          )}
          <Button variant="outline" onClick={() => handleExport("PDF")}>Exportar PDF</Button>
          <Button onClick={() => handleExport("PNG")}>Exportar PNG HD</Button>
        </div>
      </div>
    </div>
  );
}
