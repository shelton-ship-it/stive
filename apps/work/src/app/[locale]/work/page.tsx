import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Work — Productivity Suite",
  description: "Suite de produtividade completa: Docs, Write, Sheets e Deck sob stive.tech/work.",
};

export default function WorkSuiteLandingPage() {
  const products = [
    {
      name: "Stive Docs",
      href: "/work/docs",
      icon: "📄",
      desc: "Junte, divida, comprima e assine PDFs online com o motor PDFCraft.",
      tag: "PDF",
    },
    {
      name: "Stive Write",
      href: "/work/write",
      icon: "✏️",
      desc: "Crie, edite e exporte ficheiros DOCX em tempo real com o GenOffice.",
      tag: "DOCX",
    },
    {
      name: "Stive Sheets",
      href: "/work/sheets",
      icon: "📊",
      desc: "Folhas de cálculo XLSX com suporte a fórmulas e cálculo dinâmico no GridCraft.",
      tag: "XLSX",
    },
    {
      name: "Stive Deck",
      href: "/work/deck",
      icon: "🎞️",
      desc: "Crie apresentações PPTX e faça apresentações em direto com o SlideCraft.",
      tag: "PPTX",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar currentPath="/work" />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Breadcrumbs items={[]} />

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Stive Work Suite
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl">
            A suite de produtividade essencial integrada na plataforma Stive (stive.tech). Selecione uma ferramenta para aceder ao seu dashboard contextual.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {products.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{p.icon}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-mono">
                    {p.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                  {p.name}
                </h3>
                <p className="text-slate-600 text-sm">{p.desc}</p>
              </div>

              <div className="mt-6 text-sm font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Aceder ao dashboard &rarr;
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
