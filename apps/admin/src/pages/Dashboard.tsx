import React from "react";
import { Navigate } from "react-router-dom";

export function Dashboard() {
  return <Navigate to="/browse" replace />;
}
