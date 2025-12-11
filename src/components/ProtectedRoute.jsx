// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react"

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  // No user → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role → block access
  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}