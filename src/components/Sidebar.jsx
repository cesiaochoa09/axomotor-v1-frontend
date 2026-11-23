import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const ALL_ROLES = ["ADMIN", "AGENT", "DRIVER"];

// Enlaces de la barra lateral y los roles que pueden verlos
const nav_links = [
  { to: "/", label: "Inicio", icon: "🏠", roles: ALL_ROLES },
  { to: "/trips", label: "Viajes", icon: "🧭", roles: ALL_ROLES },
  { to: "/incidents", label: "Incidencias y eventos", icon: "⚠️", roles: ALL_ROLES },
  { to: "/drivers", label: "Conductores", icon: "🧑‍✈️", roles: ["ADMIN", "AGENT"] },
  { to: "/vehicles", label: "Vehículos", icon: "🚗", roles: ALL_ROLES },
  { to: "/admin", label: "Administración", icon: "🛠️", roles: ["ADMIN"] },
  { to: "/account", label: "Cuenta", icon: "⚙️", roles: ALL_ROLES },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <nav className="sidebar">
      {nav_links
        // Solo se muestran las secciones permitidas para el rol del usuario
        .filter((link) => link.roles.includes(user.role))
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