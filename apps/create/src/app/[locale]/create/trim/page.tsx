import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { LosslessCut } from "@/components/engines/LosslessCut";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Trim — Corte Rápido de Vídeo e Áudio",
  description: "Corte vídeos e áudios instantaneamente sem re-codificação nem perda de qualidade.",
  keywords: ["corte de video online", "stive trim", "lossless cut", "cortar mp4", "cortar mp3"],
};

export default function TrimPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Trim",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Corte sem perdas de vídeo e áudio com LosslessCut Engine.",
  };

  const crossLinks = [
    { prompt: "Deseja editar vídeo completo?", label: "Stive Reel", href: "/reel" },
    { prompt: "Deseja criar motion graphics?", label: "Stive Motion", href: "/create/motion" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Sidebar currentPath="/create/trim" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Trim", href: "/create/trim" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            ✂️ Stive Trim
          </h1>
          <p className="text-slate-600 text-sm">
            Dashboard contextual para corte ultrarrápido sem perda de qualidade com LosslessCut Engine.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <LosslessCut />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
