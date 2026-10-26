import React from "react";
import { AdSlot } from "@stive/ads";
import { CapEngine } from "../../components/engines/CapEngine";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          📡 Stive Connect
        </h1>
        <p className="text-slate-600 text-sm">
          Ferramentas de comunicação, gravação de ecrã e transmissão em direto.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-6">
        <AdSlot plan="free" />
      </div>

      <CapEngine />
    </div>
  );
}
