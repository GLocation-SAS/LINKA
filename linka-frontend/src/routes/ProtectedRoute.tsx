import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import type { JSX } from "react";
import Loading from "../components/Loading";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />; // ✅ mostramos el gif de carga
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
