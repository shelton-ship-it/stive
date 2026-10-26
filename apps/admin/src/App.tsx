import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { BrowseDashboard } from "./pages/browse/BrowseDashboard";
import { BrowseJobs } from "./pages/browse/BrowseJobs";
import { ShieldDashboard } from "./pages/shield/ShieldDashboard";
import { ShieldReports } from "./pages/shield/ShieldReports";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <Layout>
                <BrowseDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse/jobs"
          element={
            <ProtectedRoute>
              <Layout>
                <BrowseJobs />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shield"
          element={
            <ProtectedRoute>
              <Layout>
                <ShieldDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shield/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <ShieldReports />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/browse" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
