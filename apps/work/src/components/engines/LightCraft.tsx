// BLOQUEADO: packages/engines/lightcraft é uma aplicação Rust/Cargo sem entrypoint JS exportado.
"use client";

import React, { useState } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

export function LightCraft() {
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("LightCraft Engine pronto.");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📷</span> LightCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de revelação e edição fotográfica RAW</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-slate-50 text-slate-600 border-slate-200">
            {engineState.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="text-xs text-slate-600 border-t border-slate-100 pt-4">
        {status}
      </div>
    </div>
  );
}
