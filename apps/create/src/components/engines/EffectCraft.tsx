// BLOQUEADO: packages/engines/effectcraft é uma aplicação Rust/Cargo sem entrypoint JS exportado.
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function EffectCraft({ is3D = false }: { is3D?: boolean }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [shapeColor, setShapeColor] = useState<string>("#8b5cf6");
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>(
    is3D ? "EffectCraft 3D Engine pronto." : "EffectCraft Motion Engine pronto."
  );
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const angleRef = useRef<number>(0);

  // Render 3D Scene using WebGL or Canvas 3D Projection
  const render3DScene = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, angle: number) => {
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const size = Math.min(width, height) * 0.25;

      // 3D Cube vertices
      const vertices = [
        [-1, -1, -1],
        [1, -1, -1],
        [1, 1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1],
      ];

      // Cube edges
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // Back
        [4, 5], [5, 6], [6, 7], [7, 4], // Front
        [0, 4], [1, 5], [2, 6], [3, 7], // Connecting
      ];

      const radX = angle * 0.8;
      const radY = angle * 1.2;

      // Project 3D to 2D
      const projected = vertices.map(([x, y, z]) => {
        // Rotate Y
        let x1 = (x ?? 0) * Math.cos(radY) - (z ?? 0) * Math.sin(radY);
        let z1 = (x ?? 0) * Math.sin(radY) + (z ?? 0) * Math.cos(radY);
        // Rotate X
        let y2 = (y ?? 0) * Math.cos(radX) - z1 * Math.sin(radX);
        let z2 = (y ?? 0) * Math.sin(radX) + z1 * Math.cos(radX);

        const fov = 300;
        const distance = 3;
        const scale = fov / (distance + z2);
        return [cx + x1 * size * (scale / fov), cy + y2 * size * (scale / fov)];
      });

      // Draw Cube Edges
      ctx.strokeStyle = shapeColor;
      ctx.lineWidth = wireframe ? 1.5 : 3;

      edges.forEach(([p1Idx, p2Idx]) => {
        const p1 = projected[p1Idx!];
        const p2 = projected[p2Idx!];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1[0]!, p1[1]!);
          ctx.lineTo(p2[0]!, p2[1]!);
          ctx.stroke();
        }
      });

      // Draw Cube Nodes
      projected.forEach((p) => {
        if (p) {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p[0]!, p[1]!, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    },
    [shapeColor, wireframe]
  );

  // Render 2D Motion Graphics Scene
  const renderMotionScene = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, angle: number) => {
      ctx.clearRect(0, 0, width, height);

      // Radial background
      const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width / 1.5);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(1, "#090d16");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Animated orbiting particles
      const particleCount = 12;
      for (let i = 0; i < particleCount; i++) {
        const orbitAngle = angle * (1 + i * 0.1) + (i * Math.PI * 2) / particleCount;
        const radius = 60 + i * 8;
        const px = cx + Math.cos(orbitAngle) * radius;
        const py = cy + Math.sin(orbitAngle) * radius;

        ctx.fillStyle = shapeColor;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center glowing pulse
      const pulse = Math.sin(angle * 3) * 10 + 25;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      ctx.fill();
    },
    [shapeColor]
  );

  // Main Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        angleRef.current += delta * speed;
      }

      if (is3D) {
        render3DScene(ctx, canvas.width, canvas.height, angleRef.current);
      } else {
        renderMotionScene(ctx, canvas.width, canvas.height, angleRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, speed, is3D, render3DScene, renderMotionScene]);

  const handleRenderExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setEngineState("processing");
      setStatus(`A renderizar e capturar frame da cena ${is3D ? "3D" : "Motion"}...`);

      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Falha ao capturar imagem do viewport.");
        const url = URL.createObjectURL(blob);
        const fileName = `stive_effectcraft_${is3D ? "3d" : "motion"}_frame.png`;

        setExportedFile({ url, fileName });
        setEngineState("done");
        setStatus(`Renderização ${is3D ? "3D" : "Motion"} concluída com sucesso!`);
      }, "image/png");
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro na renderização.");
    }
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
              ? "Visualização e composição 3D acelerada em tempo real no navegador"
              : "Animações e motion graphics profissionais client-side"}
          </p>
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

      {/* Canvas Viewport */}
      <div className="bg-slate-900 rounded-lg p-4 min-h-[300px] flex items-center justify-center text-white mb-6 border border-slate-800">
        <canvas
          ref={canvasRef}
          width={600}
          height={320}
          className="max-w-full rounded shadow-2xl border border-slate-800"
        />
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "⏸️ Pausar" : "▶️ Reproduzir"}
          </Button>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Velocidade:</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="px-2 py-1 border rounded bg-white font-medium text-slate-800"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1.0x</option>
              <option value={2}>2.0x</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Cor do Elemento:</span>
            <input
              type="color"
              value={shapeColor}
              onChange={(e) => setShapeColor(e.target.value)}
              className="w-7 h-7 rounded border cursor-pointer"
            />
          </div>

          {is3D && (
            <label className="flex items-center gap-1 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={wireframe}
                onChange={(e) => setWireframe(e.target.checked)}
              />
              Modo Wireframe
            </label>
          )}
        </div>
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
              📥 Descarregar Frame {exportedFile.fileName}
            </a>
          )}
          <Button onClick={handleRenderExport}>
            Renderizar {is3D ? "Modelo 3D" : "Animação"}
          </Button>
        </div>
      </div>
    </div>
  );
}
