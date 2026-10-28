// AGUARDA BUILD WASM: correr wasm-pack build --target web --release para gerar pkg/
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function PhotoCraftEngine() {
  useEffect(() => {
    let isMounted = true;
    import("@stive/engine-photocraft")
      .then(() => {
        if (!isMounted) return;
        setStatus("PhotoCraft WASM Engine pronto (Stive Pix).");
      })
      .catch((err) => {
        if (!isMounted) return;
        setEngineState("error");
        setStatus(`AGUARDA BUILD WASM: correr wasm-pack build --target web --release para gerar pkg/ (${err instanceof Error ? err.message : String(err)})`);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(100);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("PhotoCraft Engine pronto (Stive Pix).");
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const renderCanvas = (currentRotation = rotation, currentScale = scale) => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseWidth = (img.naturalWidth || img.width) * (currentScale / 100);
    const baseHeight = (img.naturalHeight || img.height) * (currentScale / 100);

    const isRotated90 = (currentRotation / 90) % 2 !== 0;
    canvas.width = isRotated90 ? baseHeight : baseWidth;
    canvas.height = isRotated90 ? baseWidth : baseHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((currentRotation * Math.PI) / 180);
    ctx.drawImage(img, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);
    ctx.restore();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExportedFile(null);
      setEngineState("loading");
      setStatus(`Carregando "${file.name}"...`);

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        imageObjRef.current = img;
        setImageLoaded(true);
        setEngineState("done");
        setStatus(`Foto "${file.name}" pronta no Stive Pix.`);
        setTimeout(() => renderCanvas(0, 100), 50);
      };

      img.onerror = () => {
        setEngineState("error");
        setStatus("Erro ao carregar a fotografia.");
      };

      img.src = url;
    }
  };

  const handleRotate = () => {
    if (!imageLoaded) return;
    const newRot = (rotation + 90) % 360;
    setRotation(newRot);
    renderCanvas(newRot, scale);
    setEngineState("done");
    setStatus(`Imagem rodada 90º (${newRot}º total).`);
  };

  const handleResize = (newScale: number) => {
    if (!imageLoaded) return;
    setScale(newScale);
    renderCanvas(rotation, newScale);
    setEngineState("done");
    setStatus(`Redimensionado para ${newScale}% do tamanho original.`);
  };

  const handleRemoveBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setEngineState("processing");
    setStatus("Removendo fundo branco/claro...");

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      if (r > 235 && g > 235 && b > 235) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setEngineState("done");
    setStatus("Fundo removido com sucesso!");
  };

  const handleExport = (format: "PNG" | "WEBP") => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) {
      setEngineState("error");
      setStatus("Carregue uma fotografia primeiro.");
      return;
    }

    try {
      setEngineState("processing");
      setStatus(`Exportando fotografia como ${format}...`);

      const mimeType = format === "PNG" ? "image/png" : "image/webp";
      const baseName = selectedFile?.name.substring(0, selectedFile.name.lastIndexOf(".")) || "pix";

      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Erro ao gerar imagem.");
        const url = URL.createObjectURL(blob);
        const fileName = `${baseName}_pix.${format.toLowerCase()}`;
        setExportedFile({ url, fileName });
        setEngineState("done");
        setStatus(`Fotografia pronta para descarregar (${fileName})!`);
      }, mimeType, 0.95);
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro ao exportar fotografia.");
    }
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
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              engineState === "done"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : engineState === "error"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : engineState === "processing"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {engineState.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 mb-6">
        <input
          type="file"
          id="pix-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="pix-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl mb-2">
            🖼️
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {selectedFile ? `Fotografia: ${selectedFile.name}` : "Selecione uma fotografia para editar"}
          </span>
          <span className="text-xs text-slate-400">Suporta PNG, JPEG, WEBP e GIF</span>
        </label>
      </div>

      {imageLoaded && (
        <div className="space-y-6 mb-6">
          <div className="bg-slate-900 rounded-lg p-4 flex items-center justify-center min-h-[260px]">
            <canvas ref={canvasRef} className="max-w-full max-h-[320px] rounded shadow object-contain" />
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <Button variant="outline" onClick={handleRotate}>
                🔄 Rodar 90º
              </Button>
              <Button variant="outline" onClick={handleRemoveBackground}>
                ✂️ Remover Fundo
              </Button>
              <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                <span>Escala:</span>
                <button
                  onClick={() => handleResize(75)}
                  className={`px-2 py-1 border rounded ${scale === 75 ? "bg-blue-600 text-white" : "bg-white"}`}
                >
                  75%
                </button>
                <button
                  onClick={() => handleResize(100)}
                  className={`px-2 py-1 border rounded ${scale === 100 ? "bg-blue-600 text-white" : "bg-white"}`}
                >
                  100%
                </button>
                <button
                  onClick={() => handleResize(150)}
                  className={`px-2 py-1 border rounded ${scale === 150 ? "bg-blue-600 text-white" : "bg-white"}`}
                >
                  150%
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <Button variant="outline" onClick={() => handleExport("PNG")} disabled={!imageLoaded}>
            Guardar PNG
          </Button>
          <Button onClick={() => handleExport("WEBP")} disabled={!imageLoaded}>
            Guardar WEBP
          </Button>
        </div>
      </div>
    </div>
  );
}
