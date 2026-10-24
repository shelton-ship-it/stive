import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { PDFCraft } from "@/components/engines/PDFCraft";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Docs — Edit PDF Online",
  description: "Ferramentas profissionais para juntar, dividir, comprimir e assinar PDFs online com o PDFCraft Engine.",
  keywords: ["edit pdf online", "stive docs", "juntar pdf", "dividir pdf", "comprimir pdf", "assinar pdf"],
};

export default function WorkDocsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Docs",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "description": "Edit PDF online with Stive Docs and PDFCraft engine.",
    "keywords": "edit pdf online",
  };

  const crossLinks = [
    { prompt: "Deseja fazer cálculos?", label: "Stive Calc", href: "/calc" },
    { prompt: "Deseja converter este PDF?", label: "Stive Convert", href: "/convert" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Sidebar currentPath="/work/docs" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Docs", href: "/work/docs" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            📄 Stive Docs
          </h1>
          <p className="text-slate-600 text-sm">
            Dashboard contextual focado exclusivamente em documentos PDF. Junte, divida, comprima e assine PDFs online.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <PDFCraft />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
