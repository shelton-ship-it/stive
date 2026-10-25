import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { EffectCraft } from "@/components/engines/EffectCraft";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive 3D — Visualização e Composição 3D",
  description: "Visualize e componha modelos 3D em tempo real com aceleração por GPU usando o EffectCraft Engine.",
  keywords: ["editor 3d online", "stive 3d", "render 3d webgpu", "effectcraft 3d", "visualizador 3d"],
};

export default function ThreeDPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive 3D",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "All",
    "description": "Visualização e composição 3D com EffectCraft Engine.",
  };

  const crossLinks = [
    { prompt: "Deseja criar motion graphics?", label: "Stive Motion", href: "/create/motion" },
    { prompt: "Deseja desenhar vetores?", label: "Stive Vector", href: "/create/vector" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Sidebar currentPath="/create/3d" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "3D", href: "/create/3d" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            🧊 Stive 3D
          </h1>
          <p className="text-slate-600 text-sm">
            Dashboard contextual para visualização e composição 3D com EffectCraft Engine.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <EffectCraft is3D={true} />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
