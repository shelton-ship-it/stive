// BLOQUEADO: packages/engines/cap é uma aplicação Rust/Tauri/Bun monorepo sem entrypoint de biblioteca JS exportado.
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function CapEngine() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordMic, setRecordMic] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("Cap Screen Recorder Engine pronto.");
  const [recordedResult, setRecordedResult] = useState<ExportedFile | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setEngineState("loading");
      setStatus("Solicitando permissão de gravação de ecrã ao navegador...");
      setRecordedResult(null);
      chunksRef.current = [];

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });

      let combinedStream = displayStream;

      if (recordMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioCtx = new AudioContext();
          const dest = audioCtx.createMediaStreamDestination();

          if (displayStream.getAudioTracks().length > 0) {
            const displaySource = audioCtx.createMediaStreamSource(displayStream);
            displaySource.connect(dest);
          }

          const micSource = audioCtx.createMediaStreamSource(micStream);
          micSource.connect(dest);

          combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...dest.stream.getAudioTracks(),
          ]);
        } catch {
          // Fallback if mic permission denied
          setStatus("Aviso: Áudio do microfone indisponível. Gravando apenas ecrã.");
        }
      }

      streamRef.current = combinedStream;

      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
        videoRef.current.play();
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(combinedStream, { mimeType });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const fileName = `stive_cap_recording_${Date.now()}.webm`;

        setRecordedResult({ url, fileName });
        setEngineState("done");
        setStatus(`Gravação de ecrã concluída! O vídeo está pronto para download.`);

        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
          videoRef.current.controls = true;
        }
      };

      // Handle user stopping stream via browser UI bar
      displayStream.getVideoTracks()[0]!.onended = () => {
        stopRecording();
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;

      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setEngineState("processing");
      setStatus("🔴 A gravar ecrã em tempo real...");

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro ao iniciar a gravação de ecrã.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        setStatus("🔴 Gravação de ecrã retomada.");
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        setStatus("⏸️ Gravação de ecrã pausada.");
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🎥</span> CapEngine (Stive Connect)
          </h2>
          <p className="text-sm text-slate-500">Gravação de ecrã e áudio no navegador em alta definição</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              isRecording
                ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                : engineState === "done"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            {isRecording ? "GRAVANDO" : engineState.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-4 min-h-[300px] flex flex-col items-center justify-center mb-6">
        <video
          ref={videoRef}
          autoPlay
          muted={isRecording}
          className={`max-h-[320px] rounded shadow border border-slate-800 ${
            isRecording || recordedResult ? "block" : "hidden"
          }`}
        />
        {!isRecording && !recordedResult && (
          <div className="text-center text-white py-12">
            <div className="text-4xl mb-3">🎥 Gravador de Ecrã</div>
            <p className="text-slate-400 text-xs max-w-sm">
              Grave o seu ecrã inteiro, janela de aplicação ou tab de browser com qualidade original.
            </p>
          </div>
        )}
      </div>

      {/* Recording Options and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6 text-xs">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={recordMic}
              disabled={isRecording}
              onChange={(e) => setRecordMic(e.target.checked)}
            />
            🎙️ Incluir Microfone
          </label>

          {isRecording && (
            <div className="font-mono text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded border border-rose-200">
              ⏱️ {formatTimer(recordingTime)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isRecording && (
            <Button variant="outline" onClick={pauseRecording}>
              {isPaused ? "▶️ Retomar" : "⏸️ Pausar"}
            </Button>
          )}

          <Button onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? "⏹️ Parar Gravação" : "🔴 Iniciar Gravação de Ecrã"}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-600">{status}</div>
        {recordedResult && (
          <a
            href={recordedResult.url}
            download={recordedResult.fileName}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded shadow transition-colors"
          >
            📥 Descarregar Gravação ({recordedResult.fileName})
          </a>
        )}
      </div>
    </div>
  );
}
