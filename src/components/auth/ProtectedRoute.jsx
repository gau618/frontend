import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!user)
    return (
      <Navigate
        to={`/auth?next=${encodeURIComponent(
          location.pathname + location.search
        )}`}
        replace
      />
    );

  // Support both element as child and nested routes via <Outlet />
  return children || <Outlet />;
}
