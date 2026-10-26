"use client";

import React, { useState, useRef } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

export function PiikEngine() {
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("Piik WebRTC Engine pronto.");
  const [streamInfo, setStreamInfo] = useState<{ resolution: string; tracksCount: number; sdpOffer?: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const startScreenShare = async () => {
    try {
      setEngineState("loading");
      setStatus("Solicitando permissão de partilha de ecrã ao navegador...");

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack?.getSettings();
      const resolution = settings?.width && settings?.height ? `${settings.width}x${settings.height}` : "HD (Nativo)";

      // Setup RTCPeerConnection for P2P streaming setup
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      peerConnectionRef.current = pc;
      setStreamInfo({
        resolution,
        tracksCount: stream.getTracks().length,
        sdpOffer: offer.sdp ? offer.sdp.substring(0, 120) + "..." : undefined,
      });

      // Handle when user stops sharing via browser bar
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }

      setIsSharing(true);
      setEngineState("done");
      setStatus("Partilha de ecrã WebRTC ativa via Piik Engine.");
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro ao iniciar partilha de ecrã WebRTC.");
    }
  };

  const stopScreenShare = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsSharing(false);
    setStreamInfo(null);
    setEngineState("done");
    setStatus("Partilha de ecrã encerrada.");
  };

  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextMuted = !isAudioMuted;
        audioTracks.forEach((t) => (t.enabled = !nextMuted));
        setIsAudioMuted(nextMuted);
        setStatus(nextMuted ? "Áudio da partilha silenciado." : "Áudio da partilha ativado.");
      } else {
        setStatus("Nenhum canal de áudio disponível no ecrã capturado.");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📡</span> Piik WebRTC Engine (Stive Live)
          </h2>
          <p className="text-sm text-slate-500">Transmissão e partilha de ecrã P2P instantânea via WebRTC</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              isSharing
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : engineState === "error"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            {isSharing ? "EM DIRETO (P2P)" : engineState.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-4 min-h-[300px] flex flex-col items-center justify-center mb-6">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`max-h-[320px] rounded shadow border border-slate-800 ${isSharing ? "block" : "hidden"}`}
        />
        {!isSharing && (
          <div className="text-center text-white py-12">
            <div className="text-4xl mb-3">🖥️ Transmissão Parada</div>
            <p className="text-slate-400 text-xs max-w-sm">
              Conexão peer-to-peer encriptada de ponta a ponta sem instalação de plugins.
            </p>
          </div>
        )}
      </div>

      {isSharing && streamInfo && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6 text-xs space-y-2">
          <div className="flex justify-between font-semibold text-slate-700">
            <span>Resolução do Ecrã: {streamInfo.resolution}</span>
            <span>Canais de Media: {streamInfo.tracksCount}</span>
          </div>
          {streamInfo.sdpOffer && (
            <div className="text-slate-500 font-mono text-[11px] truncate">
              SDP Offer WebRTC: {streamInfo.sdpOffer}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-600">{status}</div>
        <div className="flex items-center gap-3">
          {isSharing && (
            <Button variant="outline" onClick={toggleAudio}>
              {isAudioMuted ? "🎙️ Ativar Áudio" : "🔇 Silenciar Áudio"}
            </Button>
          )}
          <Button onClick={isSharing ? stopScreenShare : startScreenShare}>
            {isSharing ? "Parar Partilha" : "Iniciar Partilha de Ecrã"}
          </Button>
        </div>
      </div>
    </div>
  );
}
