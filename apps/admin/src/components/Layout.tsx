import React from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Button } from "@stive/ui";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("stive_admin_user") || "admin@stive.internal";

  const handleLogout = () => {
    localStorage.removeItem("stive_admin_authenticated");
    localStorage.removeItem("stive_admin_mfa_verified");
    localStorage.removeItem("stive_admin_user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/40">
              VPN/TAILSCALE SECURE TUNNEL
            </span>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/40">
              MFA MANDATORY ACTIVE
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs font-medium text-slate-200">{adminEmail}</div>
              <div className="text-[10px] text-slate-400 font-mono">Role: Superadmin</div>
            </div>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5"
            >
              Sign Out
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
