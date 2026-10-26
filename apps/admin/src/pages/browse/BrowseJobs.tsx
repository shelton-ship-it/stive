import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@stive/ui";

export function BrowseJobs() {
  const [jobs, setJobs] = useState([
    { id: "job-901", type: "scrape", target: "https://example.com/data", status: "completed", proxy: "185.22.10.4", duration: "1.2s", retries: 0 },
    { id: "job-902", type: "browse", target: "https://example.org/login", status: "processing", proxy: "103.45.12.9", duration: "3.4s", retries: 0 },
    { id: "job-903", type: "scrape", target: "https://shop.test/products", status: "queued", proxy: "Pending", duration: "-", retries: 0 },
    { id: "job-904", type: "browse", target: "https://api.test/heavy", status: "failed_dlq", proxy: "192.168.1.1", duration: "10.0s", retries: 3 },
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

  const handleTriggerJob = (type: "browse" | "scrape") => {
    const newJob = {
      id: `job-${Math.floor(100 + Math.random() * 900)}`,
      type,
      target: type === "browse" ? "https://internal.test/flow" : "https://internal.test/api",
      status: "queued",
      proxy: "Rotating Pool",
      duration: "-",
      retries: 0,
    };
    setJobs([newJob, ...jobs]);
    addAuditLog("TRIGGER_AUTOMATION_JOB", `Triggered ${type} job ${newJob.id}`);
  };

  const handleRetryDlq = (jobId: string) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: "queued", retries: 0 } : j));
    addAuditLog("RETRY_DLQ_JOB", `Re-queued dead letter job ${jobId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Automation Queue — BullMQ Jobs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and Scrape worker queue management, retries & dead-letter controls
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => handleTriggerJob("browse")}
            className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-3 py-1.5"
          >
            + Trigger Browse Job
          </Button>
          <Button
            onClick={() => handleTriggerJob("scrape")}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-3 py-1.5"
          >
            + Trigger Scrape Job
          </Button>
          <Link
            to="/shield/reports"
            className="text-xs bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 px-3 py-2 rounded font-medium transition-colors"
          >
            🛡️ View Security Reports →
          </Link>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Active Job Queue ({jobs.length} total)</span>
          <span className="text-[10px] text-slate-500 font-mono">Redis BullMQ Tunnel</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 font-mono border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Job ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Target URL</th>
                <th className="px-4 py-3">Proxy</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-200">{job.id}</td>
                  <td className="px-4 py-3 font-mono uppercase text-[11px] text-cyan-400">{job.type}</td>
                  <td className="px-4 py-3 font-mono text-slate-400 max-w-xs truncate">{job.target}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{job.proxy}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        job.status === "completed"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                          : job.status === "processing"
                          ? "bg-cyan-950 text-cyan-400 border border-cyan-800/40 animate-pulse"
                          : job.status === "queued"
                          ? "bg-slate-800 text-slate-300"
                          : "bg-red-950 text-red-400 border border-red-800/40"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">{job.duration}</td>
                  <td className="px-4 py-3">
                    {job.status === "failed_dlq" ? (
                      <button
                        onClick={() => handleRetryDlq(job.id)}
                        className="text-xs text-amber-400 hover:underline font-semibold"
                      >
                        Retry DLQ
                      </button>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
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
