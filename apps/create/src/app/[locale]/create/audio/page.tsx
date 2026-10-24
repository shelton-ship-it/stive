import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { SoundCraft } from "@/components/engines/SoundCraft";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Audio — Estação de Produção de Áudio",
  description: "Grave, misture e processe faixas de áudio no navegador com o SoundCraft Engine.",
  keywords: ["audio workstation online", "stive audio", "daw online", "soundcraft"],
};

export default function CreateAudioPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Audio",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Digital audio workstation online with Stive Audio.",
  };

  const crossLinks = [
    { prompt: "Deseja cortar áudio?", label: "Stive Trim", href: "/create/trim" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Sidebar currentPath="/create/audio" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Audio", href: "/create/audio" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            🎵 Stive Audio
          </h1>
          <p className="text-slate-600 text-sm">
            Dashboard contextual focado na produção e mistura de som.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <SoundCraft />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
