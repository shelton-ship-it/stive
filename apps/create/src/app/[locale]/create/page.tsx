import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Create — Creative Suite",
  description: "Suite criativa completa: Vector, Lens, Trim, Motion, Audio, Layout e 3D sob stive.tech/create.",
};

export default function CreateSuiteLandingPage() {
  const products = [
    { name: "Stive Vector", href: "/create/vector", icon: "🎨", desc: "Design vetorial e edição SVG no VectorCraft.", tag: "VECTOR" },
    { name: "Stive Lens", href: "/create/lens", icon: "📷", desc: "Filtros e gestão de galeria fotográfica no PhotoCraft.", tag: "LENS" },
    { name: "Stive Trim", href: "/create/trim", icon: "✂️", desc: "Corte direto de vídeo/áudio sem perdas no LosslessCut.", tag: "TRIM" },
    { name: "Stive Motion", href: "/create/motion", icon: "🎬", desc: "Motion graphics e animações 2D no EffectCraft.", tag: "MOTION" },
    { name: "Stive Audio", href: "/create/audio", icon: "🎵", desc: "Estação de áudio e mistura multipista no SoundCraft.", tag: "AUDIO" },
    { name: "Stive Layout", href: "/create/layout", icon: "📐", desc: "Diagramação editorial e paginação no DesignCraft.", tag: "LAYOUT" },
    { name: "Stive 3D", href: "/create/3d", icon: "🧊", desc: "Visualização e composição 3D no EffectCraft.", tag: "3D" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar currentPath="/create" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[]} />

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Stive Create Suite
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl">
            A suite criativa para multimédia, design gráfico, áudio e 3D integrada na plataforma Stive (stive.tech).
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
          {products.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{p.icon}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-mono">
                    {p.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-2">
                  {p.name}
                </h3>
                <p className="text-slate-600 text-sm">{p.desc}</p>
              </div>

              <div className="mt-6 text-sm font-semibold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Aceder ao dashboard &rarr;
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
