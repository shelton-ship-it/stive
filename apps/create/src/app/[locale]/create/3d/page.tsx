import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { EffectCraft } from "@/components/engines/EffectCraft";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive 3D — Visualizador e Compositor 3D",
  description: "Visualize e componha modelos e cenas 3D no seu navegador com o EffectCraft Engine.",
  keywords: ["3d viewer online", "stive 3d", "composicao 3d", "effectcraft"],
};

export default function Create3DPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive 3D",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "All",
    "description": "3D graphics editor and viewer online with Stive 3D.",
  };

  const crossLinks = [
    { prompt: "Deseja motion graphics?", label: "Stive Motion", href: "/create/motion" },
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
            Dashboard contextual focado na manipulação e renderização de objetos 3D.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <EffectCraft mode="3d" />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
