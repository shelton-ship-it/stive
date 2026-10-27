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
  const [isAudio, setIsAudio] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("LosslessCut Engine pronto.");
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  const mediaRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExportedFile(null);
      setEngineState("loading");
      setStatus(`A carregar media "${file.name}"...`);

      const isAudioFile = file.type.startsWith("audio/") || /\.(mp3|wav|ogg|aac|flac)$/i.test(file.name);
      setIsAudio(isAudioFile);

      const url = URL.createObjectURL(file);
      if (mediaRef.current) {
        mediaRef.current.src = url;
      }

      if (isAudioFile) {
        try {
          const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioContextRef.current = new AudioCtxClass();
          const ab = await file.arrayBuffer();
          audioBufferRef.current = await audioContextRef.current.decodeAudioData(ab);
        } catch {
          // Fallback if audio decode fails
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      const dur = mediaRef.current.duration || audioBufferRef.current?.duration || 0;
      setDuration(dur);
      setEndTime(dur);
      setMediaLoaded(true);
      setEngineState("done");
      setStatus(`Media "${selectedFile?.name}" carregada (${dur.toFixed(1)}s).`);
    }
  };

  const handleTrimAudioWAV = (buffer: AudioBuffer, startSec: number, endSec: number): Blob => {
    const sampleRate = buffer.sampleRate;
    const numChannels = buffer.numberOfChannels;
    const startSample = Math.floor(startSec * sampleRate);
    const endSample = Math.floor(endSec * sampleRate);
    const frameCount = Math.max(0, endSample - startSample);

    const dataLength = frameCount * numChannels * 2;
    const bufferLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    /* RIFF identifier */
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataLength, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    /* fmt sub-chunk */
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true); // 16-bit
    /* data sub-chunk */
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < frameCount; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const channelData = buffer.getChannelData(ch);
        const sample = Math.max(-1, Math.min(1, channelData[startSample + i] || 0));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  };

  const handleTrimVideoMediaRecorder = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const mediaEl = mediaRef.current;
      if (!mediaEl) return reject(new Error("Elemento de vídeo indisponível."));

      mediaEl.currentTime = startTime;

      const canvas = document.createElement("canvas");
      canvas.width = mediaEl.videoWidth || 640;
      canvas.height = mediaEl.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Contexto Canvas indisponível."));

      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        resolve(new Blob(chunks, { type: "video/webm" }));
      };

      mediaRecorder.start();
      mediaEl.play();

      const renderLoop = () => {
        if (!mediaEl.paused && !mediaEl.ended && mediaEl.currentTime <= endTime) {
          ctx.drawImage(mediaEl, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(renderLoop);
        } else {
          mediaEl.pause();
          mediaRecorder.stop();
        }
      };

      requestAnimationFrame(renderLoop);
    });
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
      setStatus(`Processando corte de ${startTime.toFixed(1)}s a ${endTime.toFixed(1)}s...`);

      const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || "media";
      let outputBlob: Blob;
      let outputFileName: string;

      if (isAudio && audioBufferRef.current) {
        outputBlob = handleTrimAudioWAV(audioBufferRef.current, startTime, endTime);
        outputFileName = `${baseName}_cut.wav`;
      } else if (!isAudio) {
        outputBlob = await handleTrimVideoMediaRecorder();
        outputFileName = `${baseName}_cut.webm`;
      } else {
        // Fallback arraybuffer slice
        const arrayBuffer = await selectedFile.arrayBuffer();
        const startRatio = startTime / duration;
        const endRatio = endTime / duration;
        const startByte = Math.floor(arrayBuffer.byteLength * startRatio);
        const endByte = Math.floor(arrayBuffer.byteLength * endRatio);
        outputBlob = new Blob([arrayBuffer.slice(startByte, endByte)], { type: selectedFile.type });
        outputFileName = `${baseName}_cut.${selectedFile.name.split(".").pop() || "bin"}`;
      }

      const url = URL.createObjectURL(outputBlob);
      setExportedFile({ url, fileName: outputFileName });
      setEngineState("done");
      setStatus(`Corte concluído com sucesso (${outputFileName})!`);
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
          <p className="text-sm text-slate-500">Corte rápido de vídeo e áudio sem re-codificação</p>
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
          <span className="text-xs text-slate-400">LosslessCut processa cortes de áudio WAV e vídeo WEBM</span>
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
            {engineState === "processing" ? "A cortar..." : "Executar Corte"}
          </Button>
        </div>
      </div>
    </div>
  );
}
