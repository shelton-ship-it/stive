import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { VectorCraft } from "@/components/engines/VectorCraft";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Vector — Editor Vetorial Online",
  description: "Crie e edite gráficos vetoriais, ilustrações e ficheiros SVG online com o VectorCraft Engine.",
  keywords: ["vector editor online", "stive vector", "editar svg", "ilustracao vetorial", "vectorcraft"],
};

export default function CreateVectorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Vector",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "All",
    "description": "Vector graphics editor online with Stive Vector and VectorCraft engine.",
  };

  const crossLinks = [
    { prompt: "Deseja editar uma imagem?", label: "Stive Pix", href: "/pix" },
    { prompt: "Deseja criar um layout?", label: "Stive Layout", href: "/create/layout" },
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
            Dashboard contextual focado na criação e edição de gráficos e logótipos vetoriais.
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
