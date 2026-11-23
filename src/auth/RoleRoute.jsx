import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Permite el paso solo a los roles indicados; los demás vuelven al inicio
export default function RoleRoute({ roles }) {
  const { user } = useAuth();
  return roles.includes(user.role) ? <Outlet /> : <Navigate to="/" replace />;
}