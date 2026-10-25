import React from "react";
import Link from "next/link";

export interface CrossLinkItem {
  prompt: string;
  label: string;
  href: string;
}

export function CrossLinks({ links }: { links: CrossLinkItem[] }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="mt-12 pt-6 border-t border-slate-200">
      <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3">
        Ferramentas Relacionadas
      </h3>
      <div className="flex flex-wrap gap-4">
        {links.slice(0, 3).map((link, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-sm bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
          >
            <span className="text-slate-600">{link.prompt}</span>
            <Link
              href={link.href}
              className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
            >
              {link.label} &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
