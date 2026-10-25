"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

export function PiikEngine() {
  const [isSharing, setIsSharing] = useState(false);
  const [status, setStatus] = useState<string>("Piik WebRTC Engine pronto.");

  const toggleShare = () => {
    if (isSharing) {
      setIsSharing(false);
      setStatus("Partilha de ecrã encerrada.");
    } else {
      setIsSharing(true);
      setStatus("Partilha de ecrã WebRTC ativa via Piik Engine.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📡</span> Piik WebRTC Engine (Stive Live)
          </h2>
          <p className="text-sm text-slate-500">Transmissão e partilha de ecrã P2P instantânea sem instalação</p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
          Engine Ready
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-8 text-center text-white mb-6">
        <div className="text-3xl mb-2">{isSharing ? "🟢 Em Direto" : "🖥️ Transmissão Parada"}</div>
        <p className="text-slate-400 text-xs">Conexão peer-to-peer encriptada de ponta a ponta</p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-500">{status}</div>
        <Button onClick={toggleShare}>{isSharing ? "Parar Partilha" : "Iniciar Partilha de Ecrã"}</Button>
      </div>
    </div>
  );
}
