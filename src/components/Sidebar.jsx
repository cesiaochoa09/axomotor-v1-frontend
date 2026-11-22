import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// Enlaces de la barra lateral (label es el texto que ve el usuario)
const nav_links = [
  { to: "/", label: "Inicio", icon: "🏠" },
  { to: "/trips", label: "Viajes", icon: "🧭" },
  { to: "/incidents", label: "Incidencias y eventos", icon: "⚠️" },
  { to: "/drivers", label: "Conductores", icon: "🧑‍✈️" },
  { to: "/vehicles", label: "Vehículos", icon: "🚗" },
  { to: "/admin", label: "Administración", icon: "🛠️", admin_only: true },
  { to: "/account", label: "Cuenta", icon: "⚙️" },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <nav className="sidebar">
      {nav_links
        // Oculta "Administración" a quien no sea administrador
        .filter((link) => !link.admin_only || user.role === "ADMIN")
        .map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
    </nav>
  );
}