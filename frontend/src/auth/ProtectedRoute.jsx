import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children, requiredRole }) {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="loading-overlay">
        <div className="spinner" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole)
    return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
