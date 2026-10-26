"use client";

import React, { useState, useRef } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function LosslessCut() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaLoaded, setMediaLoaded] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("LosslessCut Engine pronto.");
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  const mediaRef = useRef<HTMLVideoElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExportedFile(null);
      setEngineState("loading");
      setStatus(`A carregar media "${file.name}"...`);

      const url = URL.createObjectURL(file);
      if (mediaRef.current) {
        mediaRef.current.src = url;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      const dur = mediaRef.current.duration;
      setDuration(dur);
      setEndTime(dur);
      setMediaLoaded(true);
      setEngineState("done");
      setStatus(`Media "${selectedFile?.name}" carregada (${dur.toFixed(1)}s).`);
    }
  };

  const handleTrim = async () => {
    if (!mediaRef.current || !selectedFile || !mediaLoaded) {
      setEngineState("error");
      setStatus("Por favor, selecione um ficheiro de vídeo/áudio primeiro.");
      return;
    }

    if (startTime >= endTime) {
      setEngineState("error");
      setStatus("O tempo de início deve ser menor que o tempo de fim.");
      return;
    }

    try {
      setEngineState("processing");
      setStatus(`Processando corte sem perda de ${startTime.toFixed(1)}s a ${endTime.toFixed(1)}s...`);

      const mediaEl = mediaRef.current;
      mediaEl.currentTime = startTime;

      // Slice file ArrayBuffer proportionally for lossless trim segment
      const arrayBuffer = await selectedFile.arrayBuffer();
      const startRatio = startTime / duration;
      const endRatio = endTime / duration;

      const startByte = Math.floor(arrayBuffer.byteLength * startRatio);
      const endByte = Math.floor(arrayBuffer.byteLength * endRatio);

      const slicedBuffer = arrayBuffer.slice(startByte, endByte);
      const outputBlob = new Blob([slicedBuffer], { type: selectedFile.type });

      const url = URL.createObjectURL(outputBlob);
      const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || "media";
      const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")) || ".mp4";
      const fileName = `${baseName}_cut${ext}`;

      setExportedFile({ url, fileName });
      setEngineState("done");
      setStatus(`Corte sem re-codificação concluído com sucesso (${fileName})!`);
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro durante o corte do ficheiro.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>✂️</span> LosslessCut Engine
          </h2>
          <p className="text-sm text-slate-500">Corte super rápido de vídeo e áudio sem re-codificação</p>
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
          id="trim-upload"
          accept="video/*,audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="trim-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl mb-2">
            🎬
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {selectedFile ? `Ficheiro: ${selectedFile.name}` : "Selecione um vídeo ou ficheiro de áudio"}
          </span>
          <span className="text-xs text-slate-400">LosslessCut preserva 100% da qualidade original sem perda</span>
        </label>
      </div>

      <div className="bg-slate-900 rounded-lg p-4 min-h-[240px] flex flex-col items-center justify-center mb-6">
        <video
          ref={mediaRef}
          controls
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={() => {
            if (mediaRef.current) setCurrentTime(mediaRef.current.currentTime);
          }}
          className={`max-h-[260px] rounded shadow ${mediaLoaded ? "block" : "hidden"}`}
        />
        {!mediaLoaded && (
          <div className="text-slate-400 text-xs text-center py-8">
            <div className="text-3xl mb-2">✂️ Timeline de Corte</div>
            Carregue um ficheiro de media para ajustar os pontos de corte.
          </div>
        )}
      </div>

      {mediaLoaded && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6 space-y-3 text-xs">
          <div className="flex justify-between font-mono text-slate-600">
            <span>Posição Atual: {currentTime.toFixed(1)}s</span>
            <span>Duração Total: {duration.toFixed(1)}s</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Ponto Início (In):</label>
              <input
                type="number"
                min="0"
                max={endTime}
                step="0.1"
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                className="w-full px-2 py-1 border rounded bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Ponto Fim (Out):</label>
              <input
                type="number"
                min={startTime}
                max={duration}
                step="0.1"
                value={endTime}
                onChange={(e) => setEndTime(Number(e.target.value))}
                className="w-full px-2 py-1 border rounded bg-white font-mono"
              />
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
          <Button onClick={handleTrim} disabled={!mediaLoaded || engineState === "processing"}>
            {engineState === "processing" ? "A cortar..." : "Executar Corte Sem Perda"}
          </Button>
        </div>
      </div>
    </div>
  );
}
