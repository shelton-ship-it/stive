import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@stive/ui";

export function BrowseDashboard() {
  const [logs, setLogs] = useState([
    { id: "log-101", timestamp: "10:42:01", level: "INFO", text: "Job #b-8823 proxy rotation complete (US-East residential)" },
    { id: "log-102", timestamp: "10:41:45", level: "INFO", text: "Job #b-8822 completed successfully (142 pages scraped)" },
    { id: "log-103", timestamp: "10:40:12", level: "WARN", text: "Domain rate limit encountered for target.com; backoff exponential retry queued" },
    { id: "log-104", timestamp: "10:38:00", level: "INFO", text: "CamofoxEngine initialized session #sess-9921" },
  ]);

  const addAuditLog = (action: string) => {
    const auditLogs = JSON.parse(localStorage.getItem("stive_admin_audit_logs") || "[]");
    auditLogs.push({
      timestamp: new Date().toISOString(),
      action,
      user: localStorage.getItem("stive_admin_user") || "admin@stive.internal",
      scope: "browse",
    });
    localStorage.setItem("stive_admin_audit_logs", JSON.stringify(auditLogs));
  };

  const handleRefreshProxies = () => {
    addAuditLog("BROWSE_REFRESH_PROXIES");
    alert("Proxy pool status refreshed.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Stive Browse — Automation Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browser automation worker cluster, proxy rotation & stealth execution
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/shield"
            className="text-xs bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 px-3 py-2 rounded font-medium transition-colors flex items-center gap-1.5"
          >
            🛡️ Need security reports? Go to Shield Dashboard →
          </Link>
        </div>
      </div>

      {/* Metrics Row: Jobs ativos, Taxa de sucesso, Proxy status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Jobs
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 mt-2">24</div>
          <p className="text-[11px] text-slate-500 mt-1">18 Scraping • 6 Browser Automation</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Success Rate (24h)
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">99.4%</div>
          <p className="text-[11px] text-slate-500 mt-1">0.6% Backoff Retries • 0 DLQ</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Proxy Status
            </div>
            <button
              onClick={handleRefreshProxies}
              className="text-[10px] text-cyan-400 hover:underline"
            >
              Refresh Pool
            </button>
          </div>
          <div className="text-3xl font-extrabold text-indigo-400 mt-2">10 / 10 Active</div>
          <p className="text-[11px] text-slate-500 mt-1">Residential Pool • Per-job Rotation</p>
        </div>
      </div>

      {/* Recent Logs Section */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200">Recent Automation Logs</h2>
          <span className="text-[10px] font-mono text-slate-500">Live JSON Stream</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-4 font-mono text-xs space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3">
              <span className="text-slate-500 font-semibold">{log.timestamp}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  log.level === "INFO"
                    ? "bg-emerald-950 text-emerald-400"
                    : "bg-amber-950 text-amber-400"
                }`}
              >
                {log.level}
              </span>
              <span className="text-slate-300">{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
