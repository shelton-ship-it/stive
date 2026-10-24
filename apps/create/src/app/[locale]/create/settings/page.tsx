import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@stive/ui";

export const metadata: Metadata = {
  title: "Settings — Stive Create Suite",
  description: "Configurações da suite Stive Create.",
};

export default function CreateSettingsPage() {
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar currentPath="/create/settings" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Settings", href: "/create/settings" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            ⚙️ Create Suite Settings
          </h1>
          <p className="text-slate-600 text-sm">
            Gerencie preferências de exportação gráfica, renderizadores GPU e definições da suite Stive Create.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Aceleração por GPU</h3>
            <p className="text-xs text-slate-500 mb-3">Ativar renderização WebGPU para filtros fotográficos e 3D.</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-purple-600 focus:ring-purple-500" />
              <span className="text-sm text-slate-700">Aceleração WebGPU / Rust ativa</span>
            </label>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Motores de Criação (Forks Privados)</h3>
            <ul className="space-y-2 text-sm text-slate-700 font-mono bg-slate-50 p-4 rounded-lg border border-slate-200">
              <li>• VectorCraft (Vector Engine Fork) — Ativo</li>
              <li>• PhotoCraft (Lens/Image Engine Fork) — Ativo</li>
              <li>• LosslessCut (Trim Engine Fork) — Ativo</li>
              <li>• EffectCraft (Motion & 3D Engine Fork) — Ativo</li>
              <li>• SoundCraft (Audio Engine Fork) — Ativo</li>
              <li>• DesignCraft (Layout Engine Fork) — Ativo</li>
            </ul>
          </div>

          <hr className="border-slate-100" />

          <div className="flex justify-end">
            <Button>Guardar Alterações</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
