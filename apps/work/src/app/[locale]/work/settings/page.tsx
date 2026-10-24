import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@stive/ui";

export const metadata: Metadata = {
  title: "Settings — Stive Work Suite",
  description: "Configurações da suite Stive Work.",
};

export default function WorkSettingsPage() {
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar currentPath="/work/settings" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Settings", href: "/work/settings" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            ⚙️ Work Suite Settings
          </h1>
          <p className="text-slate-600 text-sm">
            Gerencie preferências de exportação, motores por omissão e definições da sua conta Stive Work.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Idioma por Omissão</h3>
            <p className="text-xs text-slate-500 mb-3">Selecione a língua para os menus e assistente de produtividade.</p>
            <select className="px-3 py-2 border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="pt">Português (pt)</option>
              <option value="en">English (en)</option>
              <option value="es">Español (es)</option>
              <option value="fr">Français (fr)</option>
              <option value="de">Deutsch (de)</option>
            </select>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Motores de Processamento (Forks Privados)</h3>
            <p className="text-xs text-slate-500 mb-3">Motores ativos na sua conta Stive Work:</p>
            <ul className="space-y-2 text-sm text-slate-700 font-mono bg-slate-50 p-4 rounded-lg border border-slate-200">
              <li>• PDFCraft (PDF Engine Fork) — Ativo</li>
              <li>• GenOffice (DOCX Engine Fork) — Ativo</li>
              <li>• GridCraft (XLSX Engine Fork) — Ativo</li>
              <li>• SlideCraft (PPTX Engine Fork) — Ativo</li>
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
