"use client";

/**
 * UI Wrapper / Bridge for GridCraft Engine Fork.
 * TODO: Ligar com a API/módulo do fork privado do GridCraft em produção.
 */

import React, { useState } from "react";
import { Button } from "@stive/ui";

type CellData = { [key: string]: string };

export function GridCraft() {
  const columns = ["A", "B", "C", "D", "E", "F"];
  const rows = [1, 2, 3, 4, 5, 6, 7, 8];

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
  });

  const [selectedCell, setSelectedCell] = useState<string>("A1");
  const [formulaInput, setFormulaInput] = useState<string>(grid["A1"] || "");
  const [sheetName, setSheetName] = useState<string>("Folha1");
  const [status, setStatus] = useState<string>("");

  const handleCellClick = (cellKey: string) => {
    setSelectedCell(cellKey);
    setFormulaInput(grid[cellKey] || "");
  };

  const handleFormulaChange = (val: string) => {
    setFormulaInput(val);
    setGrid((prev) => ({ ...prev, [selectedCell]: val }));
  };

  const handleCreateSheet = () => {
    setSheetName("Nova_Folha_XLSX");
    setGrid({ A1: "Coluna A", B1: "Coluna B", C1: "Fórmula" });
    setStatus("GridCraft: Nova folha de cálculo criada.");
  };

  const handleApplyFormula = () => {
    setStatus(`GridCraft (Engine Fork): Fórmula aplicada na célula ${selectedCell}: ${formulaInput}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>📊</span> GridCraft Engine
          </h2>
          <p className="text-sm text-slate-500">Motor de folhas de cálculo XLSX (Fork Privado)</p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
          Engine Ready
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
          />
          <span className="text-xs text-slate-400 font-mono">.xlsx</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateSheet}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors"
          >
            ➕ Criar Folha
          </button>
          <button
            onClick={() => setStatus("GridCraft: Edição ativada na célula " + selectedCell)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors"
          >
            ✏️ Editar
          </button>
          <Button onClick={handleApplyFormula}>
            fx Fórmulas
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
          placeholder="Introduza um valor ou fórmula (=SUM, =AVERAGE, =B2*C2)..."
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
                  return (
                    <td
                      key={cellKey}
                      onClick={() => handleCellClick(cellKey)}
                      className={`p-2 border-r border-b border-slate-300 text-slate-800 cursor-pointer font-mono text-xs transition-colors ${
                        isSelected ? "bg-blue-100 ring-2 ring-blue-500 z-10" : ""
                      }`}
                    >
                      {grid[cellKey] || ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>{status || "GridCraft Engine pronto para cálculos, fórmulas e suporte a XLSX."}</div>
        <div>Grid Size: 6x8</div>
      </div>
    </div>
  );
}
