import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { DesignCraft } from "@/components/engines/DesignCraft";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Layout — Editoração e Diagramação",
  description: "Crie brochuras, revistas e publicações com grelhas de paginação no DesignCraft Engine.",
  keywords: ["publishing layout online", "stive layout", "diagramacao editorial", "designcraft"],
};

export default function CreateLayoutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Layout",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "All",
    "description": "Page layout and desktop publishing online with Stive Layout.",
  };

  const crossLinks = [
    { prompt: "Deseja criar um vetor?", label: "Stive Vector", href: "/create/vector" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Sidebar currentPath="/create/layout" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Layout", href: "/create/layout" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            📐 Stive Layout
          </h1>
          <p className="text-slate-600 text-sm">
            Dashboard contextual focado no design e diagramação de publicações.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <DesignCraft />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
