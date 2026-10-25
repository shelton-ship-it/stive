import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { FileeEngine } from "@/components/engines/FileeEngine";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Convert — Convert DOCX to PDF Online",
  description: "Converta ficheiros DOCX, XLSX e imagens para PDF instantaneamente no navegador com o Filee Engine.",
  keywords: ["convert docx to pdf", "stive convert", "converter docx em pdf", "filee engine"],
  alternates: {
    canonical: "https://stive.tech/convert",
  },
};

export default function ConvertPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Convert",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "description": "Conversão de documentos e DOCX para PDF com Filee Engine.",
    "keywords": "convert docx to pdf",
    "url": "https://stive.tech/convert",
  };

  const crossLinks = [
    { prompt: "Deseja editar o PDF convertido?", label: "Stive Docs", href: "https://stive.tech/work/docs" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-6 md:p-12 max-w-5xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between">
        <div className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
          <span>🔄</span> Stive Convert
        </div>
        <span className="text-xs px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full font-medium">
          stive.tech/convert
        </span>
      </header>

      <main>
        <Breadcrumbs domain="stive.tech" baseUrl="https://stive.tech" productName="Convert" productPath="/convert" />

        <div className="my-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Convert DOCX to PDF Online
          </h1>
          <p className="text-slate-600 text-sm">
            Conversão rápida e privada de documentos com o Filee Engine. Sem upload para servidores externos.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <FileeEngine />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
