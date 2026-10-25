import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { FilmCraftEngine } from "@/components/engines/FilmCraftEngine";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Reel — Video Editor Online",
  description: "Edite vídeos online diretamente no navegador com o FilmCraft Engine.",
  keywords: ["video editor online", "stive reel", "editor de video online", "filmcraft"],
};

export default function ReelPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Reel",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Edição de vídeo online com FilmCraft Engine.",
    "keywords": "video editor online",
  };

  const crossLinks = [
    { prompt: "Deseja criar motion graphics?", label: "Stive Motion", href: "/create/motion" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-6 md:p-12 max-w-5xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between">
        <div className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
          <span>🎬</span> Stive Reel
        </div>
        <span className="text-xs px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full font-medium">
          stivereel.com
        </span>
      </header>

      <main>
        <Breadcrumbs productName="Reel" productHref="/reel" />

        <div className="my-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Video Editor Online
          </h1>
          <p className="text-slate-600 text-sm">
            Editor de vídeo multi-pista grátis e privado com o FilmCraft Engine.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <FilmCraftEngine />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
