import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@stive/ui";

export function ShieldDashboard() {
  const recentScans = [
    { id: "scan-881", target: "stive-api-ci", type: "SARIF DAST", findings: 0, status: "PASSED", duration: "42s" },
    { id: "scan-880", target: "stive-web-pr-12", type: "Container Vuln", findings: 2, status: "PASSED", duration: "1m 15s" },
    { id: "scan-879", target: "stive-auth-core", type: "Dependency Audit", findings: 1, status: "PASSED", duration: "18s" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Stive Shield — Security Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Strix security engine integration, automated CI pentesting & vulnerability auditing
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/browse"
            className="text-xs bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 px-3 py-2 rounded font-medium transition-colors flex items-center gap-1.5"
          >
            ⚙️ Need browser automation jobs? Go to Browse Dashboard →
          </Link>
        </div>
      </div>

      {/* Metrics Row: Scans recentes, Vulnerabilidades encontradas, Status CI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Recent Scans (24h)
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 mt-2">18 Scans</div>
          <p className="text-[11px] text-slate-500 mt-1">CI Automation Runs • Zero Unhandled</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Vulnerabilities Found
          </div>
          <div className="flex items-baseline space-x-3 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">0</span>
            <span className="text-xs text-slate-400 font-mono">0 Critical • 0 High • 3 Low</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">All low severity findings triaged</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            CI Security Status
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">ALL PASSING</div>
          <p className="text-[11px] text-slate-500 mt-1">GH Actions Strix Runner Active</p>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200">Recent Security Scans</h2>
          <Link to="/shield/reports" className="text-xs text-cyan-400 hover:underline font-medium">
            View All Reports →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Scan ID</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Engine Mode</th>
                <th className="px-4 py-3">Findings</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-200">{scan.id}</td>
                  <td className="px-4 py-3 font-mono text-cyan-400">{scan.target}</td>
                  <td className="px-4 py-3 text-slate-400">{scan.type}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-200">{scan.findings}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{scan.duration}</td>
                  <td className="px-4 py-3">
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px] font-bold">
                      {scan.status}
                    </span>
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
