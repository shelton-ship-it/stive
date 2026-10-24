import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { SlideCraft } from "@/components/engines/SlideCraft";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Deck — Presentation Maker",
  description: "Crie, edite e apresente diapositivos e apresentações PPTX online com o SlideCraft Engine.",
  keywords: ["presentation maker", "stive deck", "apresentacoes online", "slides pptx", "criar diapositivos"],
};

export default function WorkDeckPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Deck",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "description": "Presentation maker online with Stive Deck and SlideCraft engine.",
    "keywords": "presentation maker",
  };

  const crossLinks = [
    { prompt: "Deseja editar um PDF?", label: "Stive Docs", href: "/work/docs" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Sidebar currentPath="/work/deck" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Deck", href: "/work/deck" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            🎞️ Stive Deck
          </h1>
          <p className="text-slate-600 text-sm">
            Dashboard contextual focado na criação, edição e apresentação de diapositivos PPTX.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <SlideCraft />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
