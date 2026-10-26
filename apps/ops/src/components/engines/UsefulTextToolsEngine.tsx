"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@stive/ui";

type EngineState = "idle" | "loading" | "processing" | "done" | "error";

export function UsefulTextToolsEngine() {
  const [text, setText] = useState<string>("Exemplo de texto para o Stive Ops Engine...\nAdicione mais linhas aqui.");
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"stats" | "format" | "convert">("stats");

  // Real-time Text Statistics
  const stats = useMemo(() => {
    const charsTotal = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split("\n").length : 0;
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
    const readingTimeMin = Math.ceil(words / 200);

    return { charsTotal, charsNoSpaces, words, lines, paragraphs, readingTimeMin };
  }, [text]);

  const processTextAction = (actionName: string, transformFn: (input: string) => string) => {
    try {
      setEngineState("processing");
      setErrorMessage("");

      const result = transformFn(text);
      setText(result);
      setEngineState("done");
    } catch (err) {
      setEngineState("error");
      setErrorMessage(err instanceof Error ? err.message : `Erro ao executar ${actionName}`);
    }
  };

  // Formatting operations
  const handleUpperCase = () => processTextAction("Maiúsculas", (t) => t.toUpperCase());
  const handleLowerCase = () => processTextAction("Minúsculas", (t) => t.toLowerCase());
  const handleTitleCase = () =>
    processTextAction("Title Case", (t) =>
      t.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
    );
  const handleCamelCase = () =>
    processTextAction("camelCase", (t) =>
      t
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .trim()
    );
  const handleSnakeCase = () =>
    processTextAction("snake_case", (t) =>
      t
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[\s\W]+/g, "_")
        .toLowerCase()
    );
  const handleTrimLines = () =>
    processTextAction("Aparar Linhas", (t) =>
      t
        .split("\n")
        .map((l) => l.trim())
        .join("\n")
    );
  const handleRemoveDuplicates = () =>
    processTextAction("Remover Duplicados", (t) => Array.from(new Set(t.split("\n"))).join("\n"));
  const handleSortLines = () =>
    processTextAction("Ordenar Linhas", (t) => t.split("\n").sort().join("\n"));

  // Conversion operations
  const handleBase64Encode = () =>
    processTextAction("Encode Base64", (t) => {
      return btoa(unescape(encodeURIComponent(t)));
    });

  const handleBase64Decode = () =>
    processTextAction("Decode Base64", (t) => {
      try {
        return decodeURIComponent(escape(atob(t.trim())));
      } catch {
        throw new Error("Texto fornecido não é uma string Base64 válida.");
      }
    });

  const handleURLEncode = () => processTextAction("Encode URL", (t) => encodeURIComponent(t));
  const handleURLDecode = () =>
    processTextAction("Decode URL", (t) => {
      try {
        return decodeURIComponent(t);
      } catch {
        throw new Error("Texto fornecido não possui codificação URL válida.");
      }
    });

  const handleJSONPrettify = () =>
    processTextAction("JSON Prettify", (t) => {
      const parsed = JSON.parse(t);
      return JSON.stringify(parsed, null, 2);
    });

  const handleJSONMinify = () =>
    processTextAction("JSON Minify", (t) => {
      const parsed = JSON.parse(t);
      return JSON.stringify(parsed);
    });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📝</span> UsefulTextTools Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de análise, manipulação e conversão de texto (Stive Ops)</p>
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

      {/* Mode Selector */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 pb-2">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "stats"
              ? "bg-blue-50 text-blue-700 font-semibold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📊 Estatísticas
        </button>
        <button
          onClick={() => setActiveTab("format")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "format"
              ? "bg-blue-50 text-blue-700 font-semibold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          ✨ Formatação
        </button>
        <button
          onClick={() => setActiveTab("convert")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "convert"
              ? "bg-blue-50 text-blue-700 font-semibold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          🔄 Conversão
        </button>
      </div>

      {/* Main Input Textarea */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Entrada de Texto
          </label>
          <button
            onClick={() => {
              setText("");
              setEngineState("idle");
              setErrorMessage("");
            }}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Limpar
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (engineState !== "idle") setEngineState("idle");
          }}
          rows={8}
          className="w-full p-4 border border-slate-300 rounded-lg shadow-inner font-mono text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Cole ou escreva o seu texto aqui..."
        />
      </div>

      {errorMessage && (
        <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium flex items-center justify-between">
          <span>❌ {errorMessage}</span>
          <button onClick={() => setErrorMessage("")} className="text-rose-500 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Tab Panels */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-slate-800">{stats.charsTotal}</div>
            <div className="text-xs text-slate-500 mt-1">Caracteres (Total)</div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-slate-800">{stats.charsNoSpaces}</div>
            <div className="text-xs text-slate-500 mt-1">Sem Espaços</div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-slate-800">{stats.words}</div>
            <div className="text-xs text-slate-500 mt-1">Palavras</div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-slate-800">{stats.lines}</div>
            <div className="text-xs text-slate-500 mt-1">Linhas</div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-slate-800">{stats.paragraphs}</div>
            <div className="text-xs text-slate-500 mt-1">Parágrafos</div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-slate-800">~{stats.readingTimeMin} min</div>
            <div className="text-xs text-slate-500 mt-1">Tempo de Leitura</div>
          </div>
        </div>
      )}

      {activeTab === "format" && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" onClick={handleUpperCase}>MAIÚSCULAS</Button>
          <Button variant="outline" onClick={handleLowerCase}>minúsculas</Button>
          <Button variant="outline" onClick={handleTitleCase}>Title Case</Button>
          <Button variant="outline" onClick={handleCamelCase}>camelCase</Button>
          <Button variant="outline" onClick={handleSnakeCase}>snake_case</Button>
          <Button variant="outline" onClick={handleTrimLines}>Aparar Espaços</Button>
          <Button variant="outline" onClick={handleRemoveDuplicates}>Remover Duplicados</Button>
          <Button variant="outline" onClick={handleSortLines}>Ordenar Linhas</Button>
        </div>
      )}

      {activeTab === "convert" && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" onClick={handleBase64Encode}>Base64 Encode</Button>
          <Button variant="outline" onClick={handleBase64Decode}>Base64 Decode</Button>
          <Button variant="outline" onClick={handleURLEncode}>URL Encode</Button>
          <Button variant="outline" onClick={handleURLDecode}>URL Decode</Button>
          <Button variant="outline" onClick={handleJSONPrettify}>JSON Format</Button>
          <Button variant="outline" onClick={handleJSONMinify}>JSON Minify</Button>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
        <div>Processamento 100% no navegador.</div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setEngineState("done");
          }}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          📋 Copiar Resultado
        </button>
      </div>
    </div>
  );
}
