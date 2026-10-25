import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Calc — Free Online Calculator",
  description: "Calculadora online grátis, rápida e precisa para matemática, finanças e conversões.",
  keywords: ["calculator", "stive calc", "calculadora online", "math calculator"],
  alternates: {
    canonical: "https://stive.tech/calc",
  },
};

export default function CalcPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Calc",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "description": "Calculadora online grátis com Stive Calc.",
    "keywords": "calculator",
    "url": "https://stive.tech/calc",
  };

  const crossLinks = [
    { prompt: "Deseja converter um ficheiro?", label: "Stive Convert", href: "https://stive.tech/convert" },
    { prompt: "Deseja testar a sua internet?", label: "Stive Net", href: "https://stive.tech/net" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-6 md:p-12 max-w-5xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between">
        <div className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
          <span>🧮</span> Stive Calc
        </div>
        <span className="text-xs px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full font-medium">
          stive.tech/calc
        </span>
      </header>

      <main>
        <Breadcrumbs domain="stive.tech" baseUrl="https://stive.tech" productName="Calc" productPath="/calc" />

        <div className="my-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Free Online Calculator
          </h1>
          <p className="text-slate-600 text-sm">
            Calculadora rápida e contextual para cálculos científicos, financeiros e do dia-a-dia.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6 bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md mx-auto">
          <div className="bg-slate-900 text-white font-mono text-right text-3xl p-4 rounded-lg mb-6">
            0
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            {["C", "(", ")", "/", "7", "8", "9", "*", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "="].map((btn, i) => (
              <button
                key={i}
                className={`p-4 rounded-lg font-bold text-lg border transition-all ${
                  btn === "="
                    ? "col-span-2 bg-blue-600 text-white border-blue-700 hover:bg-blue-700"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
