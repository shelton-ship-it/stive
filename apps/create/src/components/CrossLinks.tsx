import React from "react";
import Link from "next/link";

export interface CrossLinkItem {
  prompt: string;
  label: string;
  href: string;
}

export function CrossLinks({ links }: { links: CrossLinkItem[] }) {
  if (!links || links.length === 0) return null;

  // Enforce max 2-3 links rule
  const displayedLinks = links.slice(0, 3);

  return (
    <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Sugestões contextuais
      </h4>
      <ul className="space-y-2 text-sm">
        {displayedLinks.map((item, idx) => (
          <li key={idx} className="flex items-center justify-between">
            <span className="text-slate-700">{item.prompt}</span>
            <Link
              href={item.href}
              className="text-purple-600 font-medium hover:underline flex items-center gap-1"
            >
              {item.label} &rarr;
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
