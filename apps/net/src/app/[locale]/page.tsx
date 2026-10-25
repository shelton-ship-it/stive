import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Net — Internet Speed Test",
  description: "Teste a velocidade da sua ligação à internet (ping, download e upload) em tempo real.",
  keywords: ["speed test", "stive net", "teste de velocidade", "teste velocidade internet"],
};

export default function NetPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Net",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "description": "Teste de velocidade de internet grátis com Stive Net.",
    "keywords": "speed test",
  };

  const crossLinks = [
    { prompt: "Deseja fazer cálculos?", label: "Stive Calc", href: "https://stivecalc.com" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-6 md:p-12 max-w-5xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between">
        <div className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
          <span>🌐</span> Stive Net
        </div>
        <span className="text-xs px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full font-medium">
          stivenet.com
        </span>
      </header>

      <main>
        <Breadcrumbs domain="stivenet.com" baseUrl="https://stivenet.com" productName="Net" productPath="/net" />

        <div className="my-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Internet Speed Test
          </h1>
          <p className="text-slate-600 text-sm">
            Medição instantânea de débito de download, upload e latência (ping).
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6 bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center max-w-lg mx-auto">
          <div className="w-36 h-36 mx-auto rounded-full border-4 border-blue-600 flex flex-col items-center justify-center mb-6 bg-blue-50">
            <span className="text-3xl font-black text-blue-700">120</span>
            <span className="text-xs text-blue-500 font-semibold uppercase">Mbps</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center border-t border-slate-100 pt-4 mb-6">
            <div>
              <div className="text-xs text-slate-400">Ping</div>
              <div className="font-bold text-slate-800 text-lg">12 ms</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Upload</div>
              <div className="font-bold text-slate-800 text-lg">45 Mbps</div>
            </div>
          </div>

          <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition-colors">
            Iniciar Speed Test
          </button>
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
