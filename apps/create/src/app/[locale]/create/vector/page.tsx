import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { VectorCraft } from "@/components/engines/VectorCraft";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Vector — Edição Vetorial Online",
  description: "Crie e edite ilustrações vetoriais, SVGs e logótipos diretamente no seu navegador com o VectorCraft Engine.",
  keywords: ["editor vetorial online", "stive vector", "vetor svg", "desenhar svg", "vectorcraft"],
};

export default function VectorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Vector",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "All",
    "description": "Edição vetorial e SVG com VectorCraft Engine no Stive Vector.",
  };

  const crossLinks = [
    { prompt: "Deseja editar uma imagem?", label: "Stive Pix", href: "/pix" },
    { prompt: "Deseja editar fotografias?", label: "Stive Lens", href: "/create/lens" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Sidebar currentPath="/create/vector" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Vector", href: "/create/vector" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            🎨 Stive Vector
          </h1>
          <p className="text-slate-600 text-sm">
            Dashboard contextual focado exclusivamente em ilustração vetorial e gráficos SVG com o VectorCraft Engine.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <VectorCraft />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
