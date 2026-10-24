import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const fullItems: BreadcrumbItem[] = [
    { label: "stive.tech", href: "/" },
    { label: "Work", href: "/work" },
    ...items,
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-500 py-3 px-1" aria-label="Breadcrumb">
      {fullItems.map((item, index) => {
        const isLast = index === fullItems.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-slate-400 select-none">&gt;</span>}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-blue-600 transition-colors font-medium text-slate-600"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-900">{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
