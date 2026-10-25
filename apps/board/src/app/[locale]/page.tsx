import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { ExcalidrawEngine } from "@/components/engines/ExcalidrawEngine";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Board — Whiteboard Online",
  description: "Quadro interativo e colaborativo online para diagramas, esquemas e desenhos com Excalidraw/Piik Engine.",
  keywords: ["whiteboard online", "stive board", "quadro interativo online", "excalidraw"],
};

export default function BoardPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Board",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "All",
    "description": "Quadro branco colaborativo com Excalidraw Engine.",
    "keywords": "whiteboard online",
  };

  const crossLinks = [
    { prompt: "Deseja partilhar o ecrã?", label: "Stive Live", href: "/live" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-6 md:p-12 max-w-5xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between">
        <div className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
          <span>📋</span> Stive Board
        </div>
        <span className="text-xs px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full font-medium">
          stiveboard.com
        </span>
      </header>

      <main>
        <Breadcrumbs productName="Board" productHref="/board" />

        <div className="my-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Whiteboard Online
          </h1>
          <p className="text-slate-600 text-sm">
            Quadro branco colaborativo em tempo real alimentado pelo Excalidraw e Piik Engine.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <ExcalidrawEngine />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
