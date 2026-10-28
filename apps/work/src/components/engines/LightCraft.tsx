// AGUARDA BUILD WASM: correr wasm-pack build --target web --release para gerar pkg/
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

export function LightCraft() {
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("LightCraft Engine pronto.");

  useEffect(() => {
    let isMounted = true;
    setEngineState("loading");
    setStatus("Carregando LightCraft WASM Engine...");

    import("@stive/engine-lightcraft")
      .then(() => {
        if (!isMounted) return;
        setEngineState("done");
        setStatus("LightCraft WASM Engine pronto.");
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📷</span> LightCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de revelação RAW e edição de fotografia</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              engineState === "done"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : engineState === "error"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {engineState.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-4">
        <div>{status}</div>
      </div>
    </div>
  );
}
