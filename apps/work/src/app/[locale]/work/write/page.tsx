import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { GenOffice } from "@/components/engines/GenOffice";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Write — Edit DOCX Online",
  description: "Crie, edite e exporte documentos DOCX online no seu navegador com o GenOffice Engine.",
  keywords: ["edit docx", "stive write", "criar docx", "editar docx online", "processador de texto"],
};

export default function WorkWritePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Write",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "description": "Edit DOCX documents online with Stive Write and GenOffice engine.",
    "keywords": "edit docx",
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
      <Sidebar currentPath="/work/write" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Write", href: "/work/write" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            ✏️ Stive Write
          </h1>
          <p className="text-slate-600 text-sm">
            Dashboard contextual focado na criação, edição e exportação de ficheiros DOCX.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <GenOffice />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
