import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { EffectCraft } from "@/components/engines/EffectCraft";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Motion — Motion Graphics Online",
  description: "Crie efeitos visuais e animações em motion graphics no seu navegador com o EffectCraft Engine.",
  keywords: ["motion graphics online", "stive motion", "effectcraft", "animacao 2d", "efeitos visuais"],
};

export default function MotionPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Motion",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Motion graphics e animações com EffectCraft Engine.",
  };

  const crossLinks = [
    { prompt: "Deseja visualizar em 3D?", label: "Stive 3D", href: "/create/3d" },
    { prompt: "Deseja cortar vídeos?", label: "Stive Trim", href: "/create/trim" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Sidebar currentPath="/create/motion" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Motion", href: "/create/motion" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            🎬 Stive Motion
          </h1>
          <p className="text-slate-600 text-sm">
            Dashboard contextual para criação de motion graphics e animações com EffectCraft Engine.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <EffectCraft is3D={false} />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
