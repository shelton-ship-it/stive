import React from "react";
export function AdSlot({ plan = "free" }: { plan?: string }) {
  if (plan !== "free") return null;
  return <div className="p-2 text-xs text-center bg-gray-100">Ad Banner (Free Tier)</div>;
}
