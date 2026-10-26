import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@stive/ui";

export function ShieldReports() {
  const [reports, setReports] = useState([
    { id: "rep-2025-001", target: "@stive/auth", format: "SARIF / JSON", severity: "LOW", date: "2025-02-28 09:12", author: "CI Strix Runner" },
    { id: "rep-2025-002", target: "@stive/api", format: "SARIF", severity: "CLEAN", date: "2025-02-27 18:30", author: "CI Strix Runner" },
    { id: "rep-2025-003", target: "@stive/db", format: "JSON", severity: "CLEAN", date: "2025-02-26 14:05", author: "CI Strix Runner" },
  ]);

  const addAuditLog = (action: string, details: string) => {
    const auditLogs = JSON.parse(localStorage.getItem("stive_admin_audit_logs") || "[]");
    auditLogs.push({
      timestamp: new Date().toISOString(),
      action,
      details,
      user: localStorage.getItem("stive_admin_user") || "admin@stive.internal",
    });
    localStorage.setItem("stive_admin_audit_logs", JSON.stringify(auditLogs));
  };

  const handleTriggerScan = () => {
    const newReport = {
      id: `rep-2025-0${Math.floor(100 + Math.random() * 900)}`,
      target: "@stive/monorepo-ci",
      format: "SARIF / JSON",
      severity: "IN_PROGRESS",
      date: new Date().toISOString().replace("T", " ").slice(0, 16),
      author: "Admin Trigger",
    };
    setReports([newReport, ...reports]);
    addAuditLog("TRIGGER_SECURITY_SCAN", `Triggered Strix security scan ${newReport.id}`);
  };

  const handleDownloadSarif = (reportId: string) => {
    addAuditLog("DOWNLOAD_SARIF_REPORT", `Downloaded SARIF report for ${reportId}`);
    alert(`Downloading SARIF security report artifact: ${reportId}.sarif.json`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Scan Reports — Strix SARIF Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Audited vulnerability scan reports, SARIF export artifacts & CI security traces
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleTriggerScan}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5"
          >
            + Trigger Security Scan
          </Button>
          <Link
            to="/browse/jobs"
            className="text-xs bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 px-3 py-2 rounded font-medium transition-colors"
          >
            ⚙️ View Automation Queue →
          </Link>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Generated Reports ({reports.length})</span>
          <span className="text-[10px] text-slate-500 font-mono">SARIF 2.1.0 Standard</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Report ID</th>
                <th className="px-4 py-3">Target Scope</th>
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Execution Time</th>
                <th className="px-4 py-3">Triggered By</th>
                <th className="px-4 py-3">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-200">{rep.id}</td>
                  <td className="px-4 py-3 font-mono text-cyan-400">{rep.target}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{rep.format}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.severity === "CLEAN"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                          : rep.severity === "LOW"
                          ? "bg-amber-950 text-amber-400 border border-amber-800/40"
                          : "bg-cyan-950 text-cyan-400 border border-cyan-800/40 animate-pulse"
                      }`}
                    >
                      {rep.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">{rep.date}</td>
                  <td className="px-4 py-3 text-slate-400">{rep.author}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDownloadSarif(rep.id)}
                      className="text-xs text-cyan-400 hover:underline font-medium"
                    >
                      Download SARIF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
