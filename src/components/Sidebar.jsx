import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Icon from "./Icon";

const ALL_ROLES = ["ADMIN", "AGENT", "DRIVER"];

const ROLE_LABELS = {
  ADMIN: "Administrador",
  DRIVER: "Conductor",
  AGENT: "Agente",
};

// Enlaces de la barra lateral y los roles que pueden verlos
const nav_links = [
  { to: "/", label: "Inicio", icon: "home", roles: ALL_ROLES },
  { to: "/trips", label: "Viajes", icon: "trips", roles: ALL_ROLES },
  { to: "/incidents", label: "Incidencias y eventos", icon: "incidents", roles: ALL_ROLES },
  { to: "/drivers", label: "Conductores", icon: "drivers", roles: ["ADMIN", "AGENT"] },
  { to: "/vehicles", label: "Vehículos", icon: "vehicles", roles: ALL_ROLES },
  { to: "/admin", label: "Administración", icon: "admin", roles: ["ADMIN"] },
  { to: "/account", label: "Cuenta", icon: "account", roles: ALL_ROLES },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handle_logout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="app-side">
      <div className="app-brand">
        <span className="app-logo">A</span>
        AxoMotor
      </div>

      <nav className="app-nav">
        {nav_links
          // Solo se muestran las secciones permitidas para el rol del usuario
          .filter((link) => link.roles.includes(user.role))
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                isActive ? "app-nav-link active" : "app-nav-link"
              }
            >
              <Icon name={link.icon} />
              {link.label}
            </NavLink>
          ))}
      </nav>

      <div className="app-side-footer">
        <span>Sesión de {ROLE_LABELS[user.role] ?? user.role}</span>
        <button onClick={handle_logout}>Cerrar sesión</button>
      </div>
    </aside>
  );
}