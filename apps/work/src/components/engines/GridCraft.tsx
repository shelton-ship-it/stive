"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@stive/ui";

type CellData = { [key: string]: string };
type EngineState = "idle" | "loading" | "processing" | "done" | "error";

interface ExportedFile {
  url: string;
  fileName: string;
}

export function GridCraft() {
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const [grid, setGrid] = useState<CellData>({
    A1: "Item",
    B1: "Quantidade",
    C1: "Preço Unitário",
    D1: "Total",
    A2: "Licenças Stive",
    B2: "10",
    C2: "25",
    D2: "=B2*C2",
    A3: "Suporte",
    B3: "1",
    C3: "100",
    D3: "=B3*C3",
    A4: "Total Geral",
    D4: "=SUM(D2:D3)",
  });

  const [selectedCell, setSelectedCell] = useState<string>("A1");
  const [formulaInput, setFormulaInput] = useState<string>(grid["A1"] || "");
  const [sheetName, setSheetName] = useState<string>("Folha_Calculo_Stive");
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [status, setStatus] = useState<string>("GridCraft Engine pronto.");
  const [exportedFile, setExportedFile] = useState<ExportedFile | null>(null);

  // Parse and evaluate cell formula or value
  const evaluateCell = (cellKey: string, currentGrid: CellData, visited = new Set<string>()): string => {
    const raw = currentGrid[cellKey];
    if (!raw) return "";
    if (!raw.startsWith("=")) return raw;

    if (visited.has(cellKey)) return "#CIRCULAR!";
    visited.add(cellKey);

    const expr = raw.substring(1).trim().toUpperCase();

    try {
      // Functions: SUM(B2:B5), AVERAGE(B2:B5), MIN(B2:B5), MAX(B2:B5)
      const rangeMatch = expr.match(/^(SUM|AVERAGE|MIN|MAX)\(([A-H]\d+):([A-H]\d+)\)$/);
      if (rangeMatch && rangeMatch[1] && rangeMatch[2] && rangeMatch[3]) {
        const func = rangeMatch[1];
        const start = rangeMatch[2];
        const end = rangeMatch[3];

        const startCol = start.charAt(0);
        const startRow = parseInt(start.substring(1), 10);
        const endCol = end.charAt(0);
        const endRow = parseInt(end.substring(1), 10);

        const startColIdx = columns.indexOf(startCol);
        const endColIdx = columns.indexOf(endCol);

        const values: number[] = [];
        for (let c = Math.min(startColIdx, endColIdx); c <= Math.max(startColIdx, endColIdx); c++) {
          const colName = columns[c]!;
          for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
            const valStr = evaluateCell(`${colName}${r}`, currentGrid, new Set(visited));
            const num = parseFloat(valStr);
            if (!isNaN(num)) values.push(num);
          }
        }

        if (values.length === 0) return "0";
        if (func === "SUM") return values.reduce((a, b) => a + b, 0).toString();
        if (func === "AVERAGE") return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
        if (func === "MIN") return Math.min(...values).toString();
        if (func === "MAX") return Math.max(...values).toString();
      }

      // Simple arithmetic with cell refs like B2*C2 or B2+B3
      let evalExpr = expr;
      const refRegex = /[A-H]\d+/g;
      evalExpr = evalExpr.replace(refRegex, (ref) => {
        const refVal = evaluateCell(ref, currentGrid, new Set(visited));
        const num = parseFloat(refVal);
        return isNaN(num) ? "0" : num.toString();
      });

      // Safe math evaluation
      if (/^[0-9+\-*/().\s]+$/.test(evalExpr)) {
        // eslint-disable-next-line no-eval
        const res = Function(`"use strict"; return (${evalExpr})`)();
        return typeof res === "number" ? res.toString() : "#VALOR!";
      }

      return "#ERRO!";
    } catch {
      return "#ERRO!";
    }
  };

  const computedGrid = useMemo(() => {
    const computed: CellData = {};
    for (const key of Object.keys(grid)) {
      computed[key] = evaluateCell(key, grid);
    }
    return computed;
  }, [grid]);

  const handleCellClick = (cellKey: string) => {
    setSelectedCell(cellKey);
    setFormulaInput(grid[cellKey] || "");
  };

  const handleFormulaChange = (val: string) => {
    setFormulaInput(val);
    setGrid((prev) => ({ ...prev, [selectedCell]: val }));
    if (engineState !== "idle") setEngineState("idle");
  };

  const handleCreateSheet = () => {
    setSheetName("Nova_Folha_XLSX");
    setGrid({ A1: "Coluna A", B1: "Coluna B", C1: "Fórmula", A2: "10", B2: "20", C2: "=A2+B2" });
    setSelectedCell("A1");
    setFormulaInput("Coluna A");
    setExportedFile(null);
    setEngineState("done");
    setStatus("GridCraft: Nova folha de cálculo criada.");
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setEngineState("loading");
        setStatus(`Importando CSV "${file.name}"...`);
        const text = await file.text();
        const lines = text.split("\n");
        const newGrid: CellData = {};

        lines.forEach((line, rIdx) => {
          if (rIdx >= rows.length) return;
          const cells = line.split(",");
          cells.forEach((cellVal, cIdx) => {
            if (cIdx >= columns.length) return;
            const cellKey = `${columns[cIdx]}${rIdx + 1}`;
            newGrid[cellKey] = cellVal.trim();
          });
        });

        setGrid(newGrid);
        setSelectedCell("A1");
        setFormulaInput(newGrid["A1"] || "");
        setDocNameFromFile(file.name);
        setEngineState("done");
        setStatus(`CSV "${file.name}" importado para a grelha.`);
      } catch (err) {
        setEngineState("error");
        setStatus(err instanceof Error ? err.message : "Erro ao importar CSV.");
      }
    }
  };

  const setDocNameFromFile = (fileName: string) => {
    const cleanName = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
    setSheetName(cleanName);
  };

  const handleExportCSV = () => {
    try {
      setEngineState("processing");
      setStatus("A gerar exportação CSV da folha de cálculo...");

      let csvContent = "";
      for (const row of rows) {
        const rowVals = columns.map((col) => {
          const cellKey = `${col}${row}`;
          const val = computedGrid[cellKey] || "";
          return `"${val.replace(/"/g, '""')}"`;
        });
        csvContent += rowVals.join(",") + "\n";
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const fileName = `${sheetName}.csv`;

      setExportedFile({ url, fileName });
      setEngineState("done");
      setStatus(`Folha exportada como "${fileName}" com sucesso!`);
    } catch (err) {
      setEngineState("error");
      setStatus(err instanceof Error ? err.message : "Erro ao exportar CSV.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📊</span> GridCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de folhas de cálculo XLSX/CSV com avaliador de fórmulas</p>
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

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
          />
          <span className="text-xs text-slate-400 font-mono">.xlsx</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors">
            📂 Importar CSV
            <input type="file" accept=".csv,.txt" onChange={handleImportCSV} className="hidden" />
          </label>
          <button
            onClick={handleCreateSheet}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors"
          >
            ➕ Criar Folha
          </button>
          <Button onClick={handleExportCSV}>
            📥 Exportar CSV / XLSX
          </Button>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center gap-2 mb-4 bg-slate-100 p-2 rounded border border-slate-300">
        <span className="text-xs font-bold font-mono text-slate-600 px-2 py-1 bg-white rounded border border-slate-300">
          {selectedCell}
        </span>
        <span className="text-sm font-semibold text-slate-500">fx</span>
        <input
          type="text"
          value={formulaInput}
          onChange={(e) => handleFormulaChange(e.target.value)}
          placeholder="Introduza um valor ou fórmula (=SUM(B2:B3), =AVERAGE(B2:B3), =B2*C2)..."
          className="flex-1 bg-white px-3 py-1 border border-slate-300 rounded text-sm font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto border border-slate-300 rounded-lg mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-200 text-slate-600 font-mono text-xs">
              <th className="w-12 p-2 border-r border-b border-slate-300 bg-slate-300 text-center">#</th>
              {columns.map((col) => (
                <th key={col} className="p-2 border-r border-b border-slate-300 min-w-[120px] text-center">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} className="hover:bg-blue-50/30">
                <td className="p-2 border-r border-b border-slate-300 bg-slate-100 font-mono text-xs text-center text-slate-500">
                  {row}
                </td>
                {columns.map((col) => {
                  const cellKey = `${col}${row}`;
                  const isSelected = selectedCell === cellKey;
                  const displayValue = computedGrid[cellKey] || "";
                  return (
                    <td
                      key={cellKey}
                      onClick={() => handleCellClick(cellKey)}
                      className={`p-2 border-r border-b border-slate-300 text-slate-800 cursor-pointer font-mono text-xs transition-colors ${
                        isSelected ? "bg-blue-100 ring-2 ring-blue-500 z-10 font-bold" : ""
                      }`}
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          <span>Grelha: 8 colunas x 10 linhas</span>
        </div>
      </div>
    </div>
  );
}
