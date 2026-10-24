import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { PhotoCraft } from "@/components/engines/PhotoCraft";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Lens — Biblioteca e Editor Fotográfico",
  description: "Ajuste fotografias, aplique filtros GPU e gira a sua galeria com o PhotoCraft Engine.",
  keywords: ["photo editor online", "stive lens", "filtros fotograficos", "photocraft"],
};

export default function CreateLensPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Lens",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "All",
    "description": "Photo library and editor online with Stive Lens and PhotoCraft engine.",
  };

  const crossLinks = [
    { prompt: "Deseja criar um vetor?", label: "Stive Vector", href: "/create/vector" },
    { prompt: "Deseja editar uma imagem?", label: "Stive Pix", href: "/pix" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Sidebar currentPath="/create/lens" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Lens", href: "/create/lens" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            📷 Stive Lens
          </h1>
          <p className="text-slate-600 text-sm">
            Dashboard contextual focado no ajuste e organização fotográfica.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <PhotoCraft />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
