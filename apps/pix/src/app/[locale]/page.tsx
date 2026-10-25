import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { PhotoCraftEngine } from "@/components/engines/PhotoCraftEngine";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Pix — Edit Image Online",
  description: "Edite imagens e fotografias online no seu navegador com o PhotoCraft Engine.",
  keywords: ["edit image online", "stive pix", "editor de imagem grátis", "photocraft"],
};

export default function PixPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Pix",
    "applicationCategory": "PhotoApplication",
    "operatingSystem": "All",
    "description": "Edição de imagens online com PhotoCraft Engine.",
    "keywords": "edit image online",
  };

  const crossLinks = [
    { prompt: "Deseja criar um vetor?", label: "Stive Vector", href: "https://stive.tech/create/vector" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-6 md:p-12 max-w-5xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between">
        <div className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
          <span>🖼️</span> Stive Pix
        </div>
        <span className="text-xs px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full font-medium">
          stivepix.com
        </span>
      </header>

      <main>
        <Breadcrumbs domain="stivepix.com" baseUrl="https://stivepix.com" productName="Pix" productPath="/pix" />

        <div className="my-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Edit Image Online
          </h1>
          <p className="text-slate-600 text-sm">
            Editor de imagens rápido e intuitivo alimentado pelo PhotoCraft Engine.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <PhotoCraftEngine />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
