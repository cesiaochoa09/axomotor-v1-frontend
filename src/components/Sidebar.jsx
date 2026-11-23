import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const ALL_ROLES = ["ADMIN", "AGENT", "DRIVER"];

const ROLE_LABELS = {
  ADMIN: "Administrador",
  DRIVER: "Conductor",
  AGENT: "Agente",
};

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handle_logout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="side">
      <div className="side-brand">
        <span className="side-logo">A</span>
        AxoMotor
      </div>

      <nav className="side-nav">
        {nav_links
          // Solo se muestran las secciones permitidas para el rol del usuario
          .filter((link) => link.roles.includes(user.role))
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => (isActive ? "side-link active" : "side-link")}
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
      </nav>

      <div className="side-footer">
        <span>Sesión de {ROLE_LABELS[user.role] ?? user.role}</span>
        <button onClick={handle_logout}>Cerrar sesión</button>
      </div>
    </aside>
  );
}