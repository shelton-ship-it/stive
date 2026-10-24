import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const fullItems: BreadcrumbItem[] = [
    { label: "stive.tech", href: "/" },
    { label: "Create", href: "/create" },
    ...items,
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": fullItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `https://stive.tech${item.href}` : undefined,
    })),
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-500 py-3 px-1" aria-label="Breadcrumb">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {fullItems.map((item, index) => {
        const isLast = index === fullItems.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-slate-400 select-none">&gt;</span>}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-purple-600 transition-colors font-medium text-slate-600"
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
