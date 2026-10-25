import React from "react";
import Link from "next/link";

export interface BreadcrumbProps {
  domain: string;
  baseUrl: string;
  productName: string;
  productPath?: string;
}

export function Breadcrumbs({
  domain,
  baseUrl,
  productName,
  productPath = "/",
}: BreadcrumbProps) {
  const fullItems = [
    { label: domain, url: baseUrl },
    { label: productName, url: `${baseUrl}${productPath}` },
  ];

  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": fullItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      <nav className="flex items-center space-x-2 text-sm text-slate-500 py-3 px-1" aria-label="Breadcrumb">
        <span className="md:hidden">
          <Link href="/" className="hover:text-blue-600 transition-colors font-medium text-slate-600">
            {domain}
          </Link>
        </span>
        <div className="hidden md:flex items-center space-x-2">
          {fullItems.map((item, index) => {
            const isLast = index === fullItems.length - 1;
            return (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-slate-400 select-none">&gt;</span>}
                {!isLast ? (
                  <Link
                    href="/"
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
        </div>
      </nav>
    </>
  );
}
