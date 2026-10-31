import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | string;
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const bg = variant === "primary" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-800";
  return (
    <button className={`px-4 py-2 rounded font-medium transition-colors ${bg} ${className}`} {...props}>
      {children}
    </button>
  );
}
