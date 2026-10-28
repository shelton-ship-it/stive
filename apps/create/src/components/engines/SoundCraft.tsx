// AGUARDA BUILD WASM: correr wasm-pack build --target web --release para gerar pkg/
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function SoundCraft() {
  useEffect(() => {
    let isMounted = true;
    // @ts-ignore Engine vendored module
    import("@stive/engine-soundcraft")
      .then(() => {
        if (!isMounted) return;
        setStatus("SoundCraft WASM Engine pronto.");
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
  const [audioLoaded, setAudioLoaded] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("SoundCraft Audio Engine pronto.");
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startTimeRef = useRef<number>(0);

  const renderWaveform = (buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rawData = buffer.getChannelData(0);
    const samples = 200;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData: number[] = [];

    for (let i = 0; i < samples; i++) {
      const blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j] || 0);
      }
      filteredData.push(sum / blockSize);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / samples;
    ctx.fillStyle = "#a855f7";

    filteredData.forEach((val, i) => {
      const height = val * canvas.height * 2.5;
      const x = i * barWidth;
      const y = (canvas.height - height) / 2;
      ctx.fillRect(x, y, Math.max(1, barWidth - 1), Math.max(2, height));
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExportedFile(null);
      setEngineState("loading");
      setStatus(`A carregar áudio "${file.name}"...`);

      try {
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
        }

        const arrayBuffer = await file.arrayBuffer();
        const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

        audioBufferRef.current = decodedBuffer;
        setDuration(decodedBuffer.duration);
        setAudioLoaded(true);
        setEngineState("done");
        setStatus(`Áudio "${file.name}" carregado (${decodedBuffer.duration.toFixed(1)}s).`);

        setTimeout(() => renderWaveform(decodedBuffer), 50);
      } catch (err) {
        setEngineState("error");
        setStatus(err instanceof Error ? err.message : "Erro ao descodificar ficheiro de áudio.");
      }
    }
  };

  const handlePlayPause = () => {
    if (!audioBufferRef.current || !audioContextRef.current) return;

    if (isPlaying) {
      if (currentSourceRef.current) {
        currentSourceRef.current.stop();
      }
      setIsPlaying(false);
      setStatus("Reprodução pausada.");
    } else {
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();

      source.buffer = audioBufferRef.current;
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      source.start(0, currentTime);
      startTimeRef.current = audioContextRef.current.currentTime - currentTime;

      currentSourceRef.current = source;
      gainNodeRef.current = gainNode;
      setIsPlaying(true);
      setStatus("Reproduzindo áudio...");

      source.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const handleNormalize = () => {
    const buffer = audioBufferRef.current;
    if (!buffer) return;

    setEngineState("processing");
    setStatus("Normalizando volume do áudio...");

    const channelData = buffer.getChannelData(0);
    let maxVal = 0;
    for (let i = 0; i < channelData.length; i++) {
      const abs = Math.abs(channelData[i]!);
      if (abs > maxVal) maxVal = abs;
    }

    if (maxVal > 0) {
      const multiplier = 0.98 / maxVal;
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = channelData[i]! * multiplier;
      }
    }

    renderWaveform(buffer);
    setEngineState("done");
    setStatus("Volume normalizado a 98% de pico.");
  };

  const handleNoiseFilter = () => {
    const buffer = audioBufferRef.current;
    if (!buffer) return;

    setEngineState("processing");
    setStatus("Filtrando frequências e ruído de fundo...");

    const channelData = buffer.getChannelData(0);
    // Simple noise floor thresholding
    const threshold = 0.02;
    for (let i = 0; i < channelData.length; i++) {
      if (Math.abs(channelData[i]!) < threshold) {
        channelData[i] = 0;
      }
    }

    renderWaveform(buffer);
    setEngineState("done");
    setStatus("Filtro de ruído aplicado.");
  };

  const handleExportWAV = () => {
    const buffer = audioBufferRef.current;
    if (!buffer) {
      setEngineState("error");
      setStatus("Carregue um áudio primeiro.");
      return;
    }

    try {
      setEngineState("processing");
      setStatus("A codificar ficheiro WAV...");

      const numChannels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const format = 1; // PCM
      const bitDepth = 16;

      const result = buffer.getChannelData(0);
      const dataLength = result.length * 2;
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
      view.setUint16(20, format, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numChannels * 2, true);
      view.setUint16(32, numChannels * 2, true);
      view.setUint16(34, bitDepth, true);
      /* data sub-chunk */
      view.setUint32(36, 0x64617461, false); // "data"
      view.setUint32(40, dataLength, true);

      // Write PCM samples
      let offset = 44;
      for (let i = 0; i < result.length; i++) {
        const s = Math.max(-1, Math.min(1, result[i]!));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }

      const blob = new Blob([arrayBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const baseName = selectedFile?.name.substring(0, selectedFile.name.lastIndexOf(".")) || "audio";
      const fileName = `${baseName}_edited.wav`;

      setExportedFile({ url, fileName });
      setEngineState("done");
      setStatus(`Áudio exportado como ${fileName}!`);
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro na exportação de áudio.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🎵</span> SoundCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Estação de trabalho e processamento de áudio digital (DAW Web Audio)</p>
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
          id="audio-upload"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl mb-2">
            🎵
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {selectedFile ? `Ficheiro: ${selectedFile.name}` : "Selecione um ficheiro de áudio para carregar"}
          </span>
          <span className="text-xs text-slate-400">Suporta MP3, WAV, AAC, OGG e FLAC</span>
        </label>
      </div>

      {audioLoaded && (
        <div className="space-y-4 mb-6">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
            <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono">
              <span>Forma de Onda de Áudio</span>
              <span>Duração: {duration.toFixed(1)}s</span>
            </div>
            <canvas ref={canvasRef} width={600} height={100} className="w-full h-24 rounded border border-slate-800" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <div className="flex items-center gap-3">
              <Button onClick={handlePlayPause}>
                {isPlaying ? "⏸️ Pausar" : "▶️ Reproduzir"}
              </Button>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Volume:</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={volume}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setVolume(v);
                    if (gainNodeRef.current) gainNodeRef.current.gain.value = v;
                  }}
                  className="w-24"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleNormalize}>
                ⚡ Normalizar Volume
              </Button>
              <Button variant="outline" onClick={handleNoiseFilter}>
                🧹 Limpeza de Ruído
              </Button>
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
          <Button onClick={handleExportWAV} disabled={!audioLoaded}>
            Exportar Áudio WAV
          </Button>
        </div>
      </div>
    </div>
  );
}
