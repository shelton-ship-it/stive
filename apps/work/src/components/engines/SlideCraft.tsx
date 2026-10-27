// BLOQUEADO: packages/engines/deckcraft é uma aplicação Rust/Cargo sem entrypoint JS exportado.
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@stive/ui";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  themeColor: string;
  layout: "title" | "content" | "quote";
}

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function SlideCraft() {
  const [slides, setSlides] = useState<Slide[]>([
    { id: "1", title: "Apresentação Stive Work", subtitle: "A Suite de Produtividade Moderna", themeColor: "#1e40af", layout: "title" },
    { id: "2", title: "Funcionalidades Principais", subtitle: "Docs, Write, Sheets e Deck integrados e colaborativos.", themeColor: "#0f766e", layout: "content" },
    { id: "3", title: "Conclusão e Próximos Passos", subtitle: "\"A melhor maneira de prever o futuro é criá-lo.\"", themeColor: "#4c1d95", layout: "quote" },
  ]);

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("SlideCraft Engine pronto.");
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  const currentSlide = slides[activeSlideIndex] ?? slides[0] ?? {
    id: "0",
    title: "",
    subtitle: "",
    themeColor: "#1e40af",
    layout: "content",
  };

  const handleCreateSlide = () => {
    const newSlide: Slide = {
      id: Math.random().toString(36).substring(2, 9),
      title: `Diapositivo ${slides.length + 1}`,
      subtitle: "Adicione o seu conteúdo aqui...",
      themeColor: "#1e40af",
      layout: "content",
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlideIndex(updated.length - 1);
    setEngineState("done");
    setStatus("Novo diapositivo adicionado.");
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      setEngineState("error");
      setStatus("A apresentação deve ter pelo menos um diapositivo.");
      return;
    }
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    setActiveSlideIndex(Math.min(activeSlideIndex, updated.length - 1));
    setEngineState("done");
    setStatus("Diapositivo removido.");
  };

  const handleUpdateSlide = (field: keyof Slide, val: string) => {
    if (activeSlideIndex < 0 || activeSlideIndex >= slides.length) return;
    const updated = [...slides];
    const target = updated[activeSlideIndex];
    if (target) {
      target[field] = val as never;
      setSlides(updated);
    }
  };

  // Keyboard controls for slideshow mode
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPresenting) return;
      if (e.key === "ArrowRight" || e.key === "Space") {
        if (activeSlideIndex < slides.length - 1) setActiveSlideIndex((prev) => prev + 1);
      } else if (e.key === "ArrowLeft") {
        if (activeSlideIndex > 0) setActiveSlideIndex((prev) => prev - 1);
      } else if (e.key === "Escape") {
        setIsPresenting(false);
      }
    },
    [isPresenting, activeSlideIndex, slides.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleExportHTML = () => {
    try {
      setEngineState("processing");
      setStatus("Exportando apresentação como HTML interativo...");

      const htmlContent = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<title>Apresentação Stive SlideCraft</title>
<style>
body { margin: 0; font-family: system-ui, sans-serif; background: #090d16; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.slide { width: 90vw; max-width: 900px; height: 500px; padding: 48px; box-sizing: border-box; border-radius: 16px; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
h1 { font-size: 2.8rem; margin-bottom: 16px; }
p { font-size: 1.4rem; opacity: 0.9; line-height: 1.6; }
</style>
</head>
<body>
${slides
  .map(
    (s, idx) => `<div class="slide" style="background: ${s.themeColor}">
<small>Diapositivo ${idx + 1} de ${slides.length}</small>
<h1>${s.title}</h1>
<p>${s.subtitle}</p>
</div>`
  )
  .join("\n")}
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const fileName = "stive_presentation.html";

      setExportedFile({ url, fileName });
      setEngineState("done");
      setStatus("Apresentação exportada com sucesso!");
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro ao exportar apresentação.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🎞️</span> SlideCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de apresentações e diapositivos interativos</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              engineState === "done"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : engineState === "error"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : engineState === "processing"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            {engineState.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 text-sm">
            Diapositivo {activeSlideIndex + 1} de {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateSlide}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors"
          >
            ➕ Criar Diapositivo
          </button>
          <button
            onClick={handleExportHTML}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors"
          >
            📥 Exportar HTML
          </button>
          <Button onClick={() => setIsPresenting(!isPresenting)}>
            {isPresenting ? "⏹️ Sair da Apresentação" : "▶️ Apresentar"}
          </Button>
        </div>
      </div>

      {/* Presentation Fullscreen Overlay Mode */}
      {isPresenting ? (
        <div
          style={{ backgroundColor: currentSlide.themeColor }}
          className="text-white rounded-xl p-12 min-h-[380px] flex flex-col justify-center items-center text-center shadow-2xl border border-slate-800 mb-6 transition-all duration-300"
        >
          <div className="text-xs uppercase tracking-widest text-white/80 mb-4 font-semibold">
            Modo Apresentação (Diapositivo {activeSlideIndex + 1}/{slides.length}) &bull; Seta Direita para avançar
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">{currentSlide.title}</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl leading-relaxed">{currentSlide.subtitle}</p>

          <div className="mt-12 flex items-center gap-4">
            <button
              disabled={activeSlideIndex === 0}
              onClick={() => setActiveSlideIndex(activeSlideIndex - 1)}
              className="px-4 py-2 bg-black/30 hover:bg-black/50 text-white text-xs font-medium rounded disabled:opacity-40 transition-colors"
            >
              &larr; Anterior
            </button>
            <button
              disabled={activeSlideIndex === slides.length - 1}
              onClick={() => setActiveSlideIndex(activeSlideIndex + 1)}
              className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded disabled:opacity-40 transition-colors shadow"
            >
              Próximo &rarr;
            </button>
          </div>
        </div>
      ) : (
        /* Normal Editor View */
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Thumbnails Sidebar */}
          <div className="col-span-12 md:col-span-3 space-y-3 max-h-[380px] overflow-y-auto pr-2">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                onClick={() => setActiveSlideIndex(idx)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                  idx === activeSlideIndex
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-1">Diapositivo {idx + 1}</div>
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">{slide.title}</div>
                </div>
                {slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSlide(idx);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 text-xs"
                    title="Remover diapositivo"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Active Canvas Editor */}
          <div className="col-span-12 md:col-span-9 bg-slate-100 rounded-xl p-8 border border-slate-300 min-h-[320px] flex flex-col justify-center items-center">
            <div
              style={{ borderTopColor: currentSlide.themeColor, borderTopWidth: "6px" }}
              className="w-full bg-white p-8 rounded-lg shadow-sm border border-slate-200 max-w-xl space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Título do Diapositivo
                </label>
                <input
                  type="text"
                  value={currentSlide.title}
                  onChange={(e) => handleUpdateSlide("title", e.target.value)}
                  className="w-full text-2xl font-bold text-slate-900 border-b border-slate-200 focus:border-blue-500 outline-none pb-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Subtítulo / Conteúdo
                </label>
                <textarea
                  value={currentSlide.subtitle}
                  onChange={(e) => handleUpdateSlide("subtitle", e.target.value)}
                  rows={3}
                  className="w-full text-base text-slate-600 border-b border-slate-200 focus:border-blue-500 outline-none pb-1 resize-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="text-xs font-semibold text-slate-500">Cor do Tema:</label>
                <input
                  type="color"
                  value={currentSlide.themeColor}
                  onChange={(e) => handleUpdateSlide("themeColor", e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-4">
        <div>{status}</div>
        <div className="flex items-center gap-4">
          {exportedFile && (
            <a
              href={exportedFile.url}
              download={exportedFile.fileName}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded shadow-sm transition-colors"
            >
              📥 Descarregar {exportedFile.fileName}
            </a>
          )}
          <span>Total de Slides: {slides.length}</span>
        </div>
      </div>
    </div>
  );
}
