import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Bloquea la ruta a quien no sea administrador
export default function AdminRoute() {
  const { user } = useAuth();
  return user.role === "ADMIN" ? <Outlet /> : <Navigate to="/" replace />;
}