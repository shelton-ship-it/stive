import React from "react";
export function Button({ children, variant = "primary" }: { children: React.ReactNode; variant?: string }) {
  const bg = variant === "primary" ? "bg-blue-600 text-white" : "bg-gray-200";
  return <button className={`px-4 py-2 rounded ${bg}`}>{children}</button>;
}
