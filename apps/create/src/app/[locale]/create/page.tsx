import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Stive Create — Suite Criativa e Multimédia",
  description: "Ferramentas completas de edição vetorial, fotográfica, áudio, vídeo e 3D no navegador.",
};

const tools = [
  { name: "Vector", icon: "🎨", href: "/create/vector", desc: "Desenho vetorial e SVG com VectorCraft Engine" },
  { name: "Lens", icon: "📷", href: "/create/lens", desc: "Edição de fotos acelerada por GPU com PhotoCraft Engine" },
  { name: "Trim", icon: "✂️", href: "/create/trim", desc: "Corte rápido sem perda com LosslessCut Engine" },
  { name: "Motion", icon: "🎬", href: "/create/motion", desc: "Motion graphics e animações com EffectCraft Engine" },
  { name: "Audio", icon: "🎵", href: "/create/audio", desc: "Tratamento de áudio com SoundCraft Engine" },
  { name: "Layout", icon: "📐", href: "/create/layout", desc: "Editoração eletrônica com DesignCraft Engine" },
  { name: "3D", icon: "🧊", href: "/create/3d", desc: "Visualização e composição 3D com EffectCraft Engine" },
];

export default function CreateHubPage() {
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar currentPath="/create" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[]} />

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            🎨 Stive Create Suite
          </h1>
          <p className="text-slate-600 text-sm">
            Selecione uma ferramenta da suite criativa para começar. Processamento 100% client-side focado na sua privacidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3">{tool.icon}</div>
              <h2 className="text-lg font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                Stive {tool.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
