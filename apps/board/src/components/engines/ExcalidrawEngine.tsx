"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@stive/ui";

type Tool = "pen" | "line" | "rect" | "circle" | "text" | "eraser";
type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function ExcalidrawEngine() {
  const [activeTool, setActiveTool] = useState<Tool>("pen");
  const [strokeColor, setStrokeColor] = useState<string>("#2563eb");
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("Board Engine pronto (Excalidraw/Piik).");
  const [history, setHistory] = useState<ImageData[]>([]);
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const tempSnapshotRef = useRef<ImageData | null>(null);

  useEffect(() => {
    let isMounted = true;
    setEngineState("loading");
    setStatus("Carregando Excalidraw Engine...");

    import("@stive/engine-excalidraw")
      .then(() => {
        if (!isMounted) return;
        setEngineState("done");
        setStatus("Excalidraw Engine carregado com sucesso.");
      })
      .catch((err) => {
        if (!isMounted) return;
        setEngineState("error");
        setStatus(`Erro ao carregar Excalidraw Engine: ${err instanceof Error ? err.message : String(err)}`);
      });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill white background on initial render
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), snap]);
  };

  const handleUndo = () => {
    if (history.length <= 1) {
      setStatus("Nenhuma ação anterior para desfazer.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previous = newHistory[newHistory.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
      setHistory(newHistory);
      setStatus("Ação desfeita.");
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
    setExportedFile(null);
    setEngineState("done");
    setStatus("Quadro limpo.");
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    startPosRef.current = coords;
    tempSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = activeTool === "eraser" ? "#ffffff" : strokeColor;
    ctx.lineWidth = activeTool === "eraser" ? lineWidth * 4 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    const startPos = startPosRef.current;

    if (activeTool === "pen" || activeTool === "eraser") {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else {
      // Restore snapshot before drawing dynamic shapes
      if (tempSnapshotRef.current) {
        ctx.putImageData(tempSnapshotRef.current, 0, 0);
      }
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;

      if (activeTool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (activeTool === "rect") {
        ctx.strokeRect(startPos.x, startPos.y, coords.x - startPos.x, coords.y - startPos.y);
      } else if (activeTool === "circle") {
        const radius = Math.sqrt(Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeTool === "text") {
        ctx.font = `${lineWidth * 6 + 12}px sans-serif`;
        ctx.fillStyle = strokeColor;
        ctx.fillText("Texto Board", coords.x, coords.y);
      }
    }
  };

  const endDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistoryState();
      setEngineState("done");
      setStatus(`Desenho atualizado com ferramenta: ${activeTool}`);
    }
  };

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setEngineState("processing");
      setStatus("Gerando ficheiro PNG do quadro...");

      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Erro ao capturar o quadro.");
        const url = URL.createObjectURL(blob);
        const fileName = "stive_board_drawing.png";
        setExportedFile({ url, fileName });
        setEngineState("done");
        setStatus("Quadro exportado como PNG com sucesso!");
      }, "image/png");
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro ao exportar o quadro.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📋</span> Excalidraw Engine (Stive Board)
          </h2>
          <p className="text-sm text-slate-500">Quadro interativo e colaborativo para diagramas e esquemas</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              engineState === "done"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : engineState === "error"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {engineState.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTool("pen")}
            className={`px-3 py-1.5 text-xs font-semibold rounded border ${
              activeTool === "pen" ? "bg-blue-600 text-white" : "bg-white text-slate-700"
            }`}
          >
            ✏️ Caneta
          </button>
          <button
            onClick={() => setActiveTool("line")}
            className={`px-3 py-1.5 text-xs font-semibold rounded border ${
              activeTool === "line" ? "bg-blue-600 text-white" : "bg-white text-slate-700"
            }`}
          >
            📏 Linha
          </button>
          <button
            onClick={() => setActiveTool("rect")}
            className={`px-3 py-1.5 text-xs font-semibold rounded border ${
              activeTool === "rect" ? "bg-blue-600 text-white" : "bg-white text-slate-700"
            }`}
          >
            🔲 Retângulo
          </button>
          <button
            onClick={() => setActiveTool("circle")}
            className={`px-3 py-1.5 text-xs font-semibold rounded border ${
              activeTool === "circle" ? "bg-blue-600 text-white" : "bg-white text-slate-700"
            }`}
          >
            ⚪ Círculo
          </button>
          <button
            onClick={() => setActiveTool("text")}
            className={`px-3 py-1.5 text-xs font-semibold rounded border ${
              activeTool === "text" ? "bg-blue-600 text-white" : "bg-white text-slate-700"
            }`}
          >
            🔤 Texto
          </button>
          <button
            onClick={() => setActiveTool("eraser")}
            className={`px-3 py-1.5 text-xs font-semibold rounded border ${
              activeTool === "eraser" ? "bg-rose-600 text-white" : "bg-white text-slate-700"
            }`}
          >
            🧹 Borracha
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Cor:</span>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-7 h-7 rounded border cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Espessura:</span>
            <input
              type="range"
              min="1"
              max="15"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20"
            />
          </div>
        </div>
      </div>

      {/* Interactive Drawing Canvas Surface */}
      <div className="border border-slate-300 rounded-lg p-2 bg-slate-100 flex items-center justify-center mb-6 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          className="bg-white rounded shadow-md cursor-crosshair max-w-full"
        />
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-600">{status}</div>
        <div className="flex items-center gap-3">
          {exportedFile && (
            <a
              href={exportedFile.url}
              download={exportedFile.fileName}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded shadow-sm transition-colors"
            >
              📥 Descarregar {exportedFile.fileName}
            </a>
          )}
          <Button variant="outline" onClick={handleUndo}>
            ↩️ Desfazer
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Limpar Quadro
          </Button>
          <Button onClick={handleDownloadPNG}>Exportar PNG</Button>
        </div>
      </div>
    </div>
  );
}
