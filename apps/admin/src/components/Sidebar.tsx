import React from "react";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isBrowseSuite = currentPath.startsWith("/browse");
  const isShieldSuite = currentPath.startsWith("/shield");

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 p-4 text-slate-300">
      <div>
        <div className="mb-6 px-2">
          <div className="flex items-center space-x-2">
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-2 py-0.5 rounded">
              INTERNAL ONLY
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-2">Stive Admin</h1>
          <p className="text-xs text-slate-400">VPN / Private Network Scope</p>
        </div>

        {/* Suite Selector Navigation */}
        <div className="space-y-6">
          {/* Browse Suite Section */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
              Automation Suite
            </div>
            <nav className="space-y-1">
              <Link
                to="/browse"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPath === "/browse"
                    ? "bg-slate-800 text-white font-semibold"
                    : "hover:bg-slate-800/60 text-slate-300"
                }`}
              >
                📊 Browse Overview
              </Link>
              <Link
                to="/browse/jobs"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPath === "/browse/jobs"
                    ? "bg-slate-800 text-white font-semibold"
                    : "hover:bg-slate-800/60 text-slate-300"
                }`}
              >
                ⚙️ Automation Jobs
              </Link>
            </nav>
          </div>

          {/* Shield Suite Section */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
              Security Suite
            </div>
            <nav className="space-y-1">
              <Link
                to="/shield"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPath === "/shield"
                    ? "bg-slate-800 text-white font-semibold"
                    : "hover:bg-slate-800/60 text-slate-300"
                }`}
              >
                🛡️ Shield Overview
              </Link>
              <Link
                to="/shield/reports"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPath === "/shield/reports"
                    ? "bg-slate-800 text-white font-semibold"
                    : "hover:bg-slate-800/60 text-slate-300"
                }`}
              >
                📜 Security Reports
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Contextual Cross-Link Banner */}
      <div className="mt-auto pt-4 border-t border-slate-800">
        {isBrowseSuite && (
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs space-y-2">
            <p className="text-slate-400 font-medium">Contextual Action</p>
            <p className="text-slate-300">Looking for security scan results?</p>
            <Link
              to="/shield"
              className="inline-block text-cyan-400 hover:text-cyan-300 font-semibold text-xs"
            >
              Go to Shield Dashboard →
            </Link>
          </div>
        )}

        {isShieldSuite && (
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs space-y-2">
            <p className="text-slate-400 font-medium">Contextual Action</p>
            <p className="text-slate-300">Need browser automation jobs?</p>
            <Link
              to="/browse"
              className="inline-block text-cyan-400 hover:text-cyan-300 font-semibold text-xs"
            >
              Go to Browse Dashboard →
            </Link>
          </div>
        )}

        <div className="mt-4 px-2 text-[10px] text-slate-500">
          Tailscale/VPN Connected • Audit Logging Active
        </div>
      </div>
    </aside>
  );
}
