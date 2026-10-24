import React from "react";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { GridCraft } from "@/components/engines/GridCraft";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Sheets — Spreadsheet Online",
  description: "Crie e edite folhas de cálculo XLSX online com fórmulas avançadas no GridCraft Engine.",
  keywords: ["spreadsheet online", "stive sheets", "folha de calculo", "editar xlsx", "formulas excel"],
};

export default function WorkSheetsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Sheets",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "description": "Spreadsheet online with Stive Sheets and GridCraft engine.",
    "keywords": "spreadsheet online",
  };

  const crossLinks = [
    { prompt: "Deseja fazer cálculos?", label: "Stive Calc", href: "/calc" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Sidebar currentPath="/work/sheets" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[{ label: "Sheets", href: "/work/sheets" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            📊 Stive Sheets
          </h1>
          <p className="text-slate-600 text-sm">
            Dashboard contextual focado na criação, edição e fórmulas em folhas de cálculo XLSX.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <GridCraft />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
