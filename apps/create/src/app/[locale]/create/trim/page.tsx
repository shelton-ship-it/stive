import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { LosslessCut } from "@/components/engines/LosslessCut";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Trim — Corte Ultrarrápido de Vídeo e Áudio",
  description: "Corte vídeos e áudios sem perda de qualidade e sem re-codificação com o LosslessCut Engine.",
  keywords: ["video trimmer online", "stive trim", "corte de video sem perdas", "losslesscut"],
};

export default function CreateTrimPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Trim",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Video and audio lossless trimmer online with Stive Trim.",
  };

  const crossLinks = [
    { prompt: "Deseja editar vídeo completo?", label: "Stive Reel", href: "/reel" },
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
            Dashboard contextual focado no corte direto e rápido de streams de multimédia.
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
