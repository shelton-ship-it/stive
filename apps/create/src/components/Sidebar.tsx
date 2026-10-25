"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
}

const createProducts: SidebarItem[] = [
  { name: "Vector", href: "/create/vector", icon: "🎨" },
  { name: "Lens", href: "/create/lens", icon: "📷" },
  { name: "Trim", href: "/create/trim", icon: "✂️" },
  { name: "Motion", href: "/create/motion", icon: "🎬" },
  { name: "Audio", href: "/create/audio", icon: "🎵" },
  { name: "Layout", href: "/create/layout", icon: "📐" },
  { name: "3D", href: "/create/3d", icon: "🧊" },
  { name: "Settings", href: "/create/settings", icon: "⚙️" },
];

export function Sidebar({ currentPath }: { currentPath?: string }) {
  const pathname = usePathname() || currentPath || "";

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen p-4 flex flex-col border-r border-slate-800">
      <div className="mb-8 px-2 flex items-center gap-2">
        <span className="font-bold text-xl tracking-wide text-purple-400">Stive Create</span>
        <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded border border-purple-700">Suite</span>
      </div>

      <nav className="flex-1 space-y-1">
        <div className="text-xs font-semibold uppercase text-slate-400 px-2 mb-2">Produtos da Suite</div>
        {createProducts.map((item) => {
          const isActive = pathname.endsWith(item.href) || pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 px-2">
        <span>stive.tech &copy; Stive Create Suite</span>
      </div>
    </aside>
  );
}
