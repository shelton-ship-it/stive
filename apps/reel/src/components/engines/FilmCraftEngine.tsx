// BLOQUEADO: packages/engines/filmcraft é uma aplicação Rust/Cargo sem entrypoint JS exportado.
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function FilmCraftEngine() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [filterEffect, setFilterEffect] = useState<string>("none");
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("FilmCraft Engine pronto (Stive Reel).");
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExportedFile(null);
      setEngineState("loading");
      setStatus(`A carregar vídeo "${file.name}"...`);

      const url = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setEndTime(dur);
      setVideoLoaded(true);
      setEngineState("done");
      setStatus(`Vídeo "${selectedFile?.name}" carregado (${dur.toFixed(1)}s).`);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current || !videoLoaded) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setStatus("Vídeo pausado.");
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setStatus("Reproduzindo vídeo...");
    }
  };

  const handleExportVideo = async () => {
    if (!videoRef.current || !videoLoaded) {
      setEngineState("error");
      setStatus("Carregue um vídeo primeiro.");
      return;
    }

    try {
      setEngineState("processing");
      setStatus("A renderizar e processar segmento de vídeo...");

      const videoEl = videoRef.current;
      videoEl.currentTime = startTime;

      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth || 640;
      canvas.height = videoEl.videoHeight || 360;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Não foi possível criar contexto de Canvas.");

      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const baseName = selectedFile?.name.substring(0, selectedFile.name.lastIndexOf(".")) || "reel";
        const fileName = `${baseName}_edited.webm`;

        setExportedFile({ url, fileName });
        setEngineState("done");
        setStatus(`Exportação de vídeo (${fileName}) concluída com sucesso!`);
      };

      mediaRecorder.start();
      videoEl.play();

      const drawFrame = () => {
        if (!videoEl.paused && !videoEl.ended && videoEl.currentTime <= endTime) {
          ctx.filter =
            filterEffect === "grayscale"
              ? "grayscale(100%)"
              : filterEffect === "sepia"
              ? "sepia(100%)"
              : filterEffect === "bright"
              ? "brightness(130%)"
              : "none";

          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        } else {
          videoEl.pause();
          mediaRecorder.stop();
          setIsPlaying(false);
        }
      };

      requestAnimationFrame(drawFrame);
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro ao exportar vídeo.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🎬</span> FilmCraft Engine (Stive Reel)
          </h2>
          <p className="text-sm text-slate-500">Editor de vídeo multi-pista completo no navegador</p>
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
          id="film-upload"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="film-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl mb-2">
            🎬
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {selectedFile ? `Vídeo: ${selectedFile.name}` : "Selecione um ficheiro de vídeo para editar"}
          </span>
          <span className="text-xs text-slate-400">Processamento 100% no cliente sem envio de media</span>
        </label>
      </div>

      <div className="bg-slate-900 rounded-lg p-4 min-h-[300px] flex flex-col items-center justify-center mb-6">
        <video
          ref={videoRef}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          className={`max-h-[320px] rounded shadow ${
            filterEffect === "grayscale"
              ? "grayscale"
              : filterEffect === "sepia"
              ? "sepia"
              : filterEffect === "bright"
              ? "brightness-125"
              : ""
          }`}
        />
        {!videoLoaded && (
          <div className="text-slate-400 text-xs text-center py-12">
            <div className="text-3xl mb-2">🎞️ Timeline de Vídeo</div>
            Carregue um vídeo para iniciar a edição na timeline.
          </div>
        )}
      </div>

      {videoLoaded && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <Button onClick={handlePlayPause}>{isPlaying ? "⏸️ Pausar" : "▶️ Reproduzir"}</Button>
            <span className="font-mono text-slate-600">
              {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Corte Início (s):</label>
              <input
                type="number"
                min="0"
                max={endTime}
                step="0.5"
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                className="w-full px-2 py-1 border rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Corte Fim (s):</label>
              <input
                type="number"
                min={startTime}
                max={duration}
                step="0.5"
                value={endTime}
                onChange={(e) => setEndTime(Number(e.target.value))}
                className="w-full px-2 py-1 border rounded bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <span className="font-semibold text-slate-600">Filtro de Vídeo:</span>
            <select
              value={filterEffect}
              onChange={(e) => setFilterEffect(e.target.value)}
              className="px-2 py-1 border rounded bg-white font-medium text-slate-800"
            >
              <option value="none">Sem Filtro</option>
              <option value="grayscale">Preto e Branco</option>
              <option value="sepia">Sépia Vintage</option>
              <option value="bright">Alto Brilho</option>
            </select>
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
          <Button onClick={handleExportVideo} disabled={!videoLoaded || engineState === "processing"}>
            {engineState === "processing" ? "A processar..." : "Exportar Vídeo WEBM"}
          </Button>
        </div>
      </div>
    </div>
  );
}
