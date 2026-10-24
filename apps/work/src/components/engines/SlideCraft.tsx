"use client";

/**
 * UI Wrapper / Bridge for SlideCraft Engine Fork.
 * TODO: Ligar com a API/módulo do fork privado do SlideCraft em produção.
 */

import React, { useState } from "react";
import { Button } from "@stive/ui";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
}

export function SlideCraft() {
  const [slides, setSlides] = useState<Slide[]>([
    { id: 1, title: "Apresentação Stive Work", subtitle: "A Suite de Produtividade Moderna" },
    { id: 2, title: "Funcionalidades Principais", subtitle: "Docs, Write, Sheets e Deck integrados" },
    { id: 3, title: "Conclusão e Próximos Passos", subtitle: "Plano de Execução e Metas" },
  ]);

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  const currentSlide = slides[activeSlideIndex] ?? slides[0] ?? { id: 0, title: "", subtitle: "" };

  const handleCreateSlide = () => {
    const newSlide: Slide = {
      id: slides.length + 1,
      title: `Diapositivo ${slides.length + 1}`,
      subtitle: "Adicione o seu conteúdo aqui",
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
    setStatus("SlideCraft: Novo diapositivo PPTX adicionado.");
  };

  const handleUpdateTitle = (val: string) => {
    if (activeSlideIndex < 0 || activeSlideIndex >= slides.length) return;
    const updated = [...slides];
    const target = updated[activeSlideIndex];
    if (target) {
      target.title = val;
      setSlides(updated);
    }
  };

  const handleUpdateSubtitle = (val: string) => {
    if (activeSlideIndex < 0 || activeSlideIndex >= slides.length) return;
    const updated = [...slides];
    const target = updated[activeSlideIndex];
    if (target) {
      target.subtitle = val;
      setSlides(updated);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🎞️</span> SlideCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de apresentações PPTX (Fork Privado)</p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
          Engine Ready
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
            onClick={() => setStatus(`SlideCraft: Editando diapositivo ${activeSlideIndex + 1}`)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors"
          >
            ✏️ Editar
          </button>
          <Button onClick={() => setIsPresenting(!isPresenting)}>
            {isPresenting ? "⏹️ Sair da Apresentação" : "▶️ Apresentar"}
          </Button>
        </div>
      </div>

      {/* Presentation Fullscreen Overlay Mode */}
      {isPresenting ? (
        <div className="bg-slate-950 text-white rounded-xl p-12 min-h-[360px] flex flex-col justify-center items-center text-center shadow-2xl border border-slate-800 mb-6">
          <div className="text-xs uppercase tracking-widest text-blue-400 mb-4 font-semibold">
            Modo Apresentação (Diapositivo {activeSlideIndex + 1}/{slides.length})
          </div>
          <h1 className="text-4xl font-extrabold mb-4">{currentSlide.title}</h1>
          <p className="text-xl text-slate-300 max-w-xl">{currentSlide.subtitle}</p>

          <div className="mt-12 flex items-center gap-4">
            <button
              disabled={activeSlideIndex === 0}
              onClick={() => setActiveSlideIndex(activeSlideIndex - 1)}
              className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded disabled:opacity-40"
            >
              &larr; Anterior
            </button>
            <button
              disabled={activeSlideIndex === slides.length - 1}
              onClick={() => setActiveSlideIndex(activeSlideIndex + 1)}
              className="px-4 py-2 bg-blue-600 text-white text-xs rounded disabled:opacity-40"
            >
              Próximo &rarr;
            </button>
          </div>
        </div>
      ) : (
        /* Normal Editor View */
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Thumbnails Sidebar */}
          <div className="col-span-12 md:col-span-3 space-y-3 max-h-[360px] overflow-y-auto pr-2">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                onClick={() => setActiveSlideIndex(idx)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  idx === activeSlideIndex
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="text-xs font-bold text-slate-400 mb-1">Diapositivo {idx + 1}</div>
                <div className="text-xs font-semibold text-slate-800 truncate">{slide.title}</div>
              </div>
            ))}
          </div>

          {/* Active Canvas Editor */}
          <div className="col-span-12 md:col-span-9 bg-slate-100 rounded-xl p-8 border border-slate-300 min-h-[300px] flex flex-col justify-center items-center">
            <div className="w-full bg-white p-8 rounded-lg shadow border border-slate-200 max-w-xl space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Título do Diapositivo
                </label>
                <input
                  type="text"
                  value={currentSlide.title}
                  onChange={(e) => handleUpdateTitle(e.target.value)}
                  className="w-full text-2xl font-bold text-slate-900 border-b border-slate-200 focus:border-blue-500 outline-none pb-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Subtítulo / Conteúdo
                </label>
                <input
                  type="text"
                  value={currentSlide.subtitle}
                  onChange={(e) => handleUpdateSubtitle(e.target.value)}
                  className="w-full text-base text-slate-600 border-b border-slate-200 focus:border-blue-500 outline-none pb-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>{status || "SlideCraft Engine pronto para edição e apresentações em PPTX."}</div>
        <div>Total de Slides: {slides.length}</div>
      </div>
    </div>
  );
}
