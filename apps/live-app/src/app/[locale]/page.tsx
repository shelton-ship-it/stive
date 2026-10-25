import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CrossLinks } from "@/components/CrossLinks";
import { PiikEngine } from "@/components/engines/PiikEngine";
import { AdSlot } from "@stive/ads";

export const metadata: Metadata = {
  title: "Stive Live — Screen Share Friends",
  description: "Partilha de ecrã instantânea P2P com amigos no seu navegador com o Piik Engine.",
  keywords: ["screen share friends", "stive live", "partilhar ecra online", "piik webwebrtc"],
};

export default function LiveAppPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Stive Live",
    "applicationCategory": "CommunicationApplication",
    "operatingSystem": "All",
    "description": "Partilha de ecrã em tempo real com amigos usando Piik Engine.",
    "keywords": "screen share friends",
  };

  const crossLinks = [
    { prompt: "Deseja gravar o ecrã?", label: "Stive Record", href: "https://stive.tech/connect/record" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-6 md:p-12 max-w-5xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between">
        <div className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
          <span>📡</span> Stive Live
        </div>
        <span className="text-xs px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full font-medium">
          stivelive.com
        </span>
      </header>

      <main>
        <Breadcrumbs domain="stivelive.com" baseUrl="https://stivelive.com" productName="Live" productPath="/live" />

        <div className="my-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Screen Share Friends
          </h1>
          <p className="text-slate-600 text-sm">
            Partilha de ecrã ultra-rápida sem registo nem instalação com o Piik Engine.
          </p>
        </div>

        <AdSlot plan="free" />

        <div className="my-6">
          <PiikEngine />
        </div>

        <CrossLinks links={crossLinks} />
      </main>
    </div>
  );
}
