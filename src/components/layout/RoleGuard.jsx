import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RoleGuard({ role, children }) {
  const location = useLocation();
  const activeRole = localStorage.getItem("nexora_role");
  if (!activeRole) return <Navigate to="/login" state={{ from: location }} replace />;
  if (activeRole !== role) {
    return <Navigate to={`/${activeRole}`} replace />;
  }
  return children;
}