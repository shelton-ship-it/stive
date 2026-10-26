import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  const isAuthenticated = localStorage.getItem("stive_admin_authenticated") === "true";
  const isMfaVerified = localStorage.getItem("stive_admin_mfa_verified") === "true";

  if (!isAuthenticated || !isMfaVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
