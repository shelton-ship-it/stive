// AGUARDA BUILD WASM: correr wasm-pack build --target web --release para gerar pkg/
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function PhotoCraft() {
  useEffect(() => {
    let isMounted = true;
    import("@stive/engine-photocraft")
      .then(() => {
        if (!isMounted) return;
        setStatus("PhotoCraft WASM Engine pronto.");
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
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [blur, setBlur] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [sepia, setSepia] = useState<boolean>(false);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("PhotoCraft Engine pronto.");
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const filterParts = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      `blur(${blur}px)`,
      grayscale ? "grayscale(100%)" : "",
      sepia ? "sepia(100%)" : "",
    ]
      .filter(Boolean)
      .join(" ");

    ctx.filter = filterParts;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExportedFile(null);
      setEngineState("loading");
      setStatus(`A carregar imagem "${file.name}"...`);

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        imageObjRef.current = img;
        setImageLoaded(true);
        setEngineState("done");
        setStatus(`Imagem "${file.name}" carregada (${img.naturalWidth}x${img.naturalHeight}px).`);
        setTimeout(() => renderCanvas(), 50);
      };

      img.onerror = () => {
        setEngineState("error");
        setStatus("Erro ao carregar a imagem selecionada.");
      };

      img.src = url;
    }
  };

  const applyAdjustments = () => {
    if (!imageLoaded) return;
    setEngineState("processing");
    setStatus("A aplicar ajustes na imagem...");
    renderCanvas();
    setEngineState("done");
    setStatus("Ajustes aplicados com sucesso.");
  };

  const handleRemoveBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setEngineState("processing");
    setStatus("Removendo fundo (limiar de cor/alfa)...");

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      // Simple threshold to remove near-white background
      if (r > 230 && g > 230 && b > 230) {
        data[i + 3] = 0; // Set transparent
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setEngineState("done");
    setStatus("Remoção de fundo concluída.");
  };

  const handleExport = (format: "PNG" | "JPEG" | "WEBP") => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) {
      setEngineState("error");
      setStatus("Carregue uma imagem primeiro para exportar.");
      return;
    }

    try {
      setEngineState("processing");
      setStatus(`Exportando imagem como ${format}...`);

      const mimeType = format === "PNG" ? "image/png" : format === "JPEG" ? "image/jpeg" : "image/webp";
      const baseName = selectedFile?.name.substring(0, selectedFile.name.lastIndexOf(".")) || "foto";

      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Erro ao gerar ficheiro de imagem.");
        const url = URL.createObjectURL(blob);
        const fileName = `${baseName}_edited.${format.toLowerCase()}`;
        setExportedFile({ url, fileName });
        setEngineState("done");
        setStatus(`Imagem exportada como ${fileName}!`);
      }, mimeType, 0.92);
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro na exportação.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📷</span> PhotoCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de edição fotográfica acelerado por Canvas 2D / GPU</p>
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

      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 mb-6">
        <input
          type="file"
          id="lens-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="lens-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl mb-2">
            📷
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {selectedFile ? `Ficheiro: ${selectedFile.name}` : "Selecione uma fotografia para editar"}
          </span>
          <span className="text-xs text-slate-400">PhotoCraft suporta PNG, JPEG, WebP</span>
        </label>
      </div>

      {imageLoaded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 bg-slate-900 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
            <canvas ref={canvasRef} className="max-w-full max-h-[360px] rounded shadow-lg object-contain" />
          </div>

          <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <h3 className="font-bold text-slate-800 text-sm">Ajustes da Imagem</h3>

            <div>
              <div className="flex justify-between mb-1 text-slate-600 font-medium">
                <span>Brilho:</span>
                <span>{brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => {
                  setBrightness(Number(e.target.value));
                  applyAdjustments();
                }}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-600 font-medium">
                <span>Contraste:</span>
                <span>{contrast}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(e) => {
                  setContrast(Number(e.target.value));
                  applyAdjustments();
                }}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-600 font-medium">
                <span>Saturação:</span>
                <span>{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => {
                  setSaturation(Number(e.target.value));
                  applyAdjustments();
                }}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-600 font-medium">
                <span>Desfocagem:</span>
                <span>{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={blur}
                onChange={(e) => {
                  setBlur(Number(e.target.value));
                  applyAdjustments();
                }}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={grayscale}
                  onChange={(e) => {
                    setGrayscale(e.target.checked);
                    applyAdjustments();
                  }}
                />
                PB / P&B
              </label>
              <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={sepia}
                  onChange={(e) => {
                    setSepia(e.target.checked);
                    applyAdjustments();
                  }}
                />
                Sépia
              </label>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <Button variant="outline" className="w-full" onClick={handleRemoveBackground}>
                ✂️ Remover Fundo Branco
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-600">{status}</div>
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
          <Button variant="outline" onClick={() => handleExport("PNG")} disabled={!imageLoaded}>
            Exportar PNG
          </Button>
          <Button onClick={() => handleExport("JPEG")} disabled={!imageLoaded}>
            Exportar JPEG
          </Button>
        </div>
      </div>
    </div>
  );
}
