import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { EffectCraft } from "@/components/engines/EffectCraft";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Motion — Motion Graphics e Animação",
  description: "Crie animações e efeitos visuais em tempo real com o EffectCraft Engine.",
  keywords: ["motion graphics online", "stive motion", "animacao 2d", "effectcraft"],
};

export default function CreateMotionPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Motion",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Motion graphics studio online with Stive Motion.",
  };

  const crossLinks = [
    { prompt: "Deseja ver em 3D?", label: "Stive 3D", href: "/create/3d" },
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
            Dashboard contextual focado no design de animações e vinhetas.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <EffectCraft mode="motion" />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
