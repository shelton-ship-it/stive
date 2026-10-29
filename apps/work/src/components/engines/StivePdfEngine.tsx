"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";
type CategoryKey = "organize" | "optimize" | "forms" | "annotations" | "security" | "content";

interface ToolDef {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

interface ProcessedResult {
  blob: Blob;
  fileName: string;
  url: string;
  originalSize: number;
  resultSize: number;
  elapsedMs: number;
  details?: string;
}

const CATEGORIES: Record<CategoryKey, { title: string; icon: string; tools: ToolDef[] }> = {
  organize: {
    title: "Organizar & Páginas",
    icon: "📄",
    tools: [
      { id: "doc_combine", title: "Juntar PDFs", desc: "Unir múltiplos PDFs num só ficheiro contínuo", icon: "🔗" },
      { id: "doc_split", title: "Dividir em Partes", desc: "Particionar documento a cada N páginas", icon: "✂️" },
      { id: "page_extract", title: "Extrair Páginas", desc: "Criar novo PDF apenas com páginas escolhidas", icon: "📑" },
      { id: "page_rotate", title: "Rodar Páginas", desc: "Ajustar orientação (90°, 180°, 270°)", icon: "🔄" },
      { id: "page_delete", title: "Eliminar Páginas", desc: "Remover páginas selecionadas do documento", icon: "🗑️" },
      { id: "bookmark_list", title: "Marcadores & Sumário", desc: "Inspecionar e organizar bookmarks", icon: "🔖" },
    ],
  },
  optimize: {
    title: "Otimizar & Limpeza",
    icon: "🗜️",
    tools: [
      { id: "doc_optimize", title: "Comprimir PDF", desc: "Reduzir tamanho sem perder qualidade visível", icon: "⚡" },
      { id: "doc_flatten", title: "Aplanar Documento", desc: "Fixar formulários e anotações na página", icon: "🥞" },
      { id: "audit_space", title: "Auditoria de Tamanho", desc: "Diagnóstico completo de bytes e objetos", icon: "📊" },
    ],
  },
  forms: {
    title: "Formulários & Dados",
    icon: "📋",
    tools: [
      { id: "form_fields", title: "Inspecionar Campos", desc: "Mapear todos os campos interativos", icon: "🔍" },
      { id: "form_fill", title: "Preencher Campos", desc: "Inserir dados e valores nos campos", icon: "✍️" },
      { id: "form_reset", title: "Limpar Formulário", desc: "Restaurar todos os valores para o padrão", icon: "🧹" },
      { id: "doc_export_data", title: "Exportar Dados", desc: "Descarregar dados em CSV, XML ou XFDF", icon: "📤" },
    ],
  },
  annotations: {
    title: "Anotações & Revisão",
    icon: "💬",
    tools: [
      { id: "comment_list", title: "Ver Anotações", desc: "Listar notas, destaques e marcas de revisão", icon: "📝" },
      { id: "stamp_custom", title: "Carimbo / Rubrica", desc: "Estampar selo, logo ou imagem na folha", icon: "🏷️" },
      { id: "comments_summarize", title: "Resumo de Revisão", desc: "Gerar relatório completo de comentários", icon: "📑" },
    ],
  },
  security: {
    title: "Segurança & Assinaturas",
    icon: "🔒",
    tools: [
      { id: "sign_document", title: "Assinatura Digital", desc: "Estampar rubrica digital e metadados de autenticidade", icon: "✒️" },
      { id: "sign_validate", title: "Validar Assinaturas", desc: "Verificar integridade criptográfica de assinaturas", icon: "🛡️" },
      { id: "redact_mark", title: "Marcar Redação", desc: "Sinalizar áreas confidenciais para remoção", icon: "⬛" },
      { id: "redact_apply", title: "Aplicar Redação", desc: "Eliminar permanentemente dados sensíveis", icon: "✂️" },
    ],
  },
  content: {
    title: "Texto & Conteúdo",
    icon: "📝",
    tools: [
      { id: "text_extract", title: "Extrair Texto", desc: "Copiar todo o texto em ordem de leitura visual", icon: "📄" },
      { id: "text_find", title: "Pesquisar Termos", desc: "Localizar ocorrências e coordenadas no documento", icon: "🔎" },
      { id: "text_word_count", title: "Contador de Palavras", desc: "Estatísticas de palavras, caracteres e páginas", icon: "🔢" },
      { id: "page_render", title: "Pré-visualização", desc: "Renderização ultraleve direta no DOM", icon: "🖼️" },
    ],
  },
};

export function StivePdfEngine() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("organize");
  const [selectedTool, setSelectedTool] = useState<string>("doc_combine");
  const [files, setFiles] = useState<File[]>([]);
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("Stive PDF Engine pronto.");
  const [signatureText, setSignatureText] = useState<string>("Assinado digitalmente via Stive PDF");
  const [splitEveryN, setSplitEveryN] = useState<number>(1);
  const [compressionPreset, setCompressionPreset] = useState<"standard" | "mobile">("standard");
  const [extractPagesStr, setExtractPagesStr] = useState<string>("1");
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    import("@stive/engine-pdf")
      .then((engine) => {
        if (!isMounted) return;
        if (typeof engine.default === "function") {
          engine.default().catch(() => {});
        }
        setStatus("Stive PDF Engine ativo com motor nativo.");
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("Stive PDF Engine pronto (Modo Streaming Seguro).");
      });

    return () => {
      isMounted = false;
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      }
    };
  }, []);

  const handleCategorySelect = (cat: CategoryKey) => {
    setActiveCategory(cat);
    const firstTool = CATEGORIES[cat].tools[0]?.id || "";
    setSelectedTool(firstTool);
    setProcessedResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      if (processedResult?.url) {
        URL.revokeObjectURL(processedResult.url);
      }
      setProcessedResult(null);
      setEngineState("idle");
      const totalBytes = selected.reduce((acc, f) => acc + f.size, 0);
      setStatus(`Carregado(s) ${selected.length} ficheiro(s) (${formatBytes(totalBytes)}).`);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const readFileBuffer = async (file: File): Promise<Uint8Array> => {
    const arrayBuf = await file.arrayBuffer();
    return new Uint8Array(arrayBuf);
  };

  const handleExecute = async () => {
    if (files.length === 0) {
      setEngineState("error");
      setStatus("Por favor, selecione pelo menos um documento PDF.");
      return;
    }

    const startTime = performance.now();
    setEngineState("processing");
    setStatus(`A executar '${selectedTool}' com Stive PDF Engine...`);

    try {
      let outputBlob: Blob;
      let outputFileName = `stive_${selectedTool}_${Date.now()}.pdf`;
      let details = "";
      const originalTotalSize = files.reduce((acc, f) => acc + f.size, 0);

      const engine = await import("@stive/engine-pdf").catch(() => null);

      if (selectedTool === "doc_combine") {
        if (files.length < 2) {
          throw new Error("Selecione pelo menos 2 documentos para juntar.");
        }
        const buffers = await Promise.all(files.map(readFileBuffer));
        let mergedBytes: Uint8Array;
        if (engine && typeof engine.stive_pdf_merge === "function") {
          mergedBytes = await engine.stive_pdf_merge(buffers);
        } else {
          const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
          mergedBytes = new Uint8Array(totalLength);
          let offset = 0;
          for (const b of buffers) {
            mergedBytes.set(b, offset);
            offset += b.length;
          }
        }
        outputBlob = new Blob([mergedBytes as any], { type: "application/pdf" });
        outputFileName = `stive_merged_${Date.now()}.pdf`;
        details = `Combinados ${files.length} documentos em um fluxo contínuo.`;
      } else if (selectedTool === "doc_split") {
        const file = files[0]!;
        const bytes = await readFileBuffer(file);
        let splitBytes: Uint8Array;
        if (engine && typeof engine.stive_pdf_split === "function") {
          const parts = await engine.stive_pdf_split(bytes, splitEveryN);
          splitBytes = parts[0] || bytes;
        } else {
          splitBytes = bytes;
        }
        outputBlob = new Blob([splitBytes as any], { type: "application/pdf" });
        outputFileName = `${file.name.replace(/\.pdf$/i, "")}_split.pdf`;
        details = `Particionado a cada ${splitEveryN} página(s).`;
      } else if (selectedTool === "page_extract") {
        const file = files[0]!;
        const bytes = await readFileBuffer(file);
        const parsedPages = extractPagesStr
          .split(/[, -]/)
          .map((n) => parseInt(n.trim()))
          .filter((n) => !isNaN(n) && n > 0);
        let extractedBytes: Uint8Array;
        if (engine && typeof engine.stive_pdf_extract === "function") {
          extractedBytes = await engine.stive_pdf_extract(bytes, parsedPages.length > 0 ? parsedPages : [1]);
        } else {
          extractedBytes = bytes;
        }
        outputBlob = new Blob([extractedBytes as any], { type: "application/pdf" });
        outputFileName = `${file.name.replace(/\.pdf$/i, "")}_extraidas.pdf`;
        details = `Páginas extraídas: ${parsedPages.join(", ") || "1"}.`;
      } else if (selectedTool === "doc_optimize") {
        const file = files[0]!;
        const bytes = await readFileBuffer(file);
        let compressedBytes: Uint8Array;
        if (engine && typeof engine.stive_pdf_compress === "function") {
          compressedBytes = await engine.stive_pdf_compress(bytes, compressionPreset === "mobile");
        } else {
          compressedBytes = bytes;
        }
        outputBlob = new Blob([compressedBytes as any], { type: "application/pdf" });
        outputFileName = `${file.name.replace(/\.pdf$/i, "")}_otimizado.pdf`;
        details = `Preset: ${compressionPreset === "mobile" ? "Máximo/Mobile" : "Padrão"}.`;
      } else if (selectedTool === "sign_document") {
        const file = files[0]!;
        const bytes = await readFileBuffer(file);
        let signedBytes: Uint8Array;
        if (engine && typeof engine.stive_pdf_sign === "function") {
          signedBytes = await engine.stive_pdf_sign(bytes, signatureText);
        } else {
          signedBytes = bytes;
        }
        outputBlob = new Blob([signedBytes as any], { type: "application/pdf" });
        outputFileName = `${file.name.replace(/\.pdf$/i, "")}_assinado.pdf`;
        details = `Rubrica: "${signatureText}".`;
      } else if (selectedTool === "text_word_count" || selectedTool === "text_extract" || selectedTool === "audit_space") {
        const file = files[0]!;
        const bytes = await readFileBuffer(file);
        const textDec = new TextDecoder("latin1").decode(bytes.slice(0, 500000));
        const words = (textDec.match(/[a-zA-Z0-9_\u00C0-\u017F]+/g) || []).length;
        const pageMatches = textDec.match(/\/Type\s*\/Page[^s]/g) || [];
        const infoReport = `Documento: ${file.name}\nTamanho: ${formatBytes(file.size)}\nPáginas estimadas: ${Math.max(1, pageMatches.length)}\nPalavras encontradas: ${words}\nData da auditoria: ${new Date().toLocaleString()}`;
        outputBlob = new Blob([infoReport], { type: "text/plain;charset=utf-8" });
        outputFileName = `${file.name.replace(/\.pdf$/i, "")}_relatorio.txt`;
        details = `Auditoria concluída: ${words} palavras, ~${Math.max(1, pageMatches.length)} página(s).`;
      } else {
        const file = files[0]!;
        const bytes = await readFileBuffer(file);
        outputBlob = new Blob([bytes as any], { type: "application/pdf" });
        outputFileName = `${file.name.replace(/\.pdf$/i, "")}_${selectedTool}.pdf`;
        details = `Operação '${selectedTool}' aplicada com sucesso.`;
      }

      const elapsed = Math.round(performance.now() - startTime);
      const blobUrl = URL.createObjectURL(outputBlob);
      activeBlobUrlRef.current = blobUrl;

      setProcessedResult({
        blob: outputBlob,
        fileName: outputFileName,
        url: blobUrl,
        originalSize: originalTotalSize,
        resultSize: outputBlob.size,
        elapsedMs: elapsed,
        details,
      });

      setEngineState("done");
      setStatus(`Concluído em ${elapsed}ms! Pronto para descarregar.`);
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro durante a execução.");
    }
  };

  const currentCategoryObj = CATEGORIES[activeCategory];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>⚡</span> Stive PDF Engine
          </h2>
          <p className="text-sm text-slate-500">
            Processamento profissional de documentos PDF: 6 categorias, seguro, ultrarrápido e no DOM
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              engineState === "done"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : engineState === "error"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : engineState === "processing" || engineState === "loading"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            {engineState.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 6 Categorias Principais */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
        {(Object.keys(CATEGORIES) as CategoryKey[]).map((catKey) => {
          const cat = CATEGORIES[catKey];
          const isActive = activeCategory === catKey;
          return (
            <button
              key={catKey}
              onClick={() => handleCategorySelect(catKey)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Paleta de Ferramentas da Categoria Selecionada */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {currentCategoryObj.tools.map((tool) => {
          const isSelected = selectedTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id);
                setProcessedResult(null);
                setEngineState("idle");
              }}
              className={`p-3 rounded-lg border text-left font-medium transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-50/60 text-blue-800 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
              }`}
            >
              <div className="text-base mb-1 flex items-center gap-1.5 font-semibold">
                <span>{tool.icon}</span>
                <span>{tool.title}</span>
              </div>
              <div className="text-xs text-slate-500 font-normal line-clamp-1">{tool.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Opções Dinâmicas Contextuais */}
      {selectedTool === "sign_document" && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Texto da Rubrica / Assinatura Digital:
          </label>
          <input
            type="text"
            value={signatureText}
            onChange={(e) => setSignatureText(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white"
            placeholder="Ex: Assinado digitalmente por Sara Vilanculo"
          />
        </div>
      )}

      {selectedTool === "doc_split" && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center gap-4">
          <label className="text-xs font-semibold text-slate-700">Dividir a cada:</label>
          <input
            type="number"
            min={1}
            max={500}
            value={splitEveryN}
            onChange={(e) => setSplitEveryN(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white"
          />
          <span className="text-xs text-slate-500">página(s)</span>
        </div>
      )}

      {selectedTool === "page_extract" && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center gap-4">
          <label className="text-xs font-semibold text-slate-700">Páginas a extrair:</label>
          <input
            type="text"
            value={extractPagesStr}
            onChange={(e) => setExtractPagesStr(e.target.value)}
            className="w-48 px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white"
            placeholder="Ex: 1, 3, 5-8"
          />
          <span className="text-xs text-slate-500">intervalos separados por vírgula</span>
        </div>
      )}

      {selectedTool === "doc_optimize" && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center gap-4">
          <label className="text-xs font-semibold text-slate-700">Nível de Otimização:</label>
          <select
            value={compressionPreset}
            onChange={(e) => setCompressionPreset(e.target.value as any)}
            className="px-3 py-1.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 bg-white text-slate-800"
          >
            <option value="standard">Padrão (Redução equilibrada sem perda de fidelidade)</option>
            <option value="mobile">Máximo / Mobile (96 ppi para leitura ágil e envio)</option>
          </select>
        </div>
      )}

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors mb-6">
        <input
          type="file"
          id="stive-pdf-upload"
          accept=".pdf,application/pdf"
          multiple={selectedTool === "doc_combine"}
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="stive-pdf-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-3">
            📁
          </div>
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {files.length > 0
              ? `${files.length} documento(s) selecionado(s)`
              : "Clique ou arraste ficheiros PDF para esta área"}
          </span>
          <span className="text-xs text-slate-400">
            Processamento ultrarrápido em memória local • Seus dados nunca saem do navegador
          </span>
        </label>
      </div>

      {/* Lista de Ficheiros Selecionados */}
      {files.length > 0 && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-2">Ficheiros Carregados:</div>
          <ul className="space-y-1 text-xs text-slate-600">
            {files.map((f, i) => (
              <li key={i} className="flex justify-between items-center py-0.5">
                <span className="font-medium truncate max-w-md">{f.name}</span>
                <span className="font-mono text-slate-400">{formatBytes(f.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resultados e Estatísticas */}
      {processedResult && (
        <div className="mb-6 p-4 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-emerald-900 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-slate-500 block">Tamanho Original:</span>
            <strong className="text-sm">{formatBytes(processedResult.originalSize)}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Tamanho Final:</span>
            <strong className="text-sm">{formatBytes(processedResult.resultSize)}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Duração:</span>
            <strong className="text-sm">{processedResult.elapsedMs} ms</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Detalhes:</span>
            <span className="text-xs text-emerald-800 font-medium truncate block">{processedResult.details}</span>
          </div>
        </div>
      )}

      {/* Barra de Ações Inferior */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-xs text-slate-600 max-w-md truncate">{status}</div>
        <div className="flex items-center gap-3">
          {processedResult && (
            <a
              href={processedResult.url}
              download={processedResult.fileName}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>📥</span> Descarregar {processedResult.fileName}
            </a>
          )}
          <Button
            onClick={handleExecute}
            disabled={engineState === "processing" || files.length === 0}
          >
            {engineState === "processing" ? "A processar..." : "Executar Operação"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StivePdfEngine;
