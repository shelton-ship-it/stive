import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Configurações — Stive Create",
  description: "Gerencie as suas definições e preferências da suite Stive Create.",
};

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar currentPath="/create/settings" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Settings", href: "/create/settings" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            ⚙️ Configurações da Suite Create
          </h1>
          <p className="text-slate-600 text-sm">
            Gerencie opções de GPU, aceleração WebGL/WebGPU e preferências de exportação.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-slate-800 text-base mb-2">Aceleração de Hardware</h3>
            <p className="text-sm text-slate-500 mb-3">Ativar renderização WebGPU para PhotoCraft e EffectCraft Engine.</p>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-purple-600" />
              <span>Usar WebGPU quando disponível</span>
            </label>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="font-semibold text-slate-800 text-base mb-2">Privacidade de Conteúdo</h3>
            <p className="text-sm text-slate-500 mb-3">Todos os ficheiros e projetos são processados 100% no navegador.</p>
            <div className="text-xs px-3 py-2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 inline-block font-semibold">
              Privacidade ativa: sem upload para servidores externos
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
