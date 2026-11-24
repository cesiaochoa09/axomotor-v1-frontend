import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [is_open, set_is_open] = useState(false);
  // null = comprobando, true = en línea, false = sin conexión
  const [is_online, set_is_online] = useState(null);

  // Comprueba si el servidor responde
  useEffect(() => {
    api
      .get("/health")
      .then(() => set_is_online(true))
      .catch(() => set_is_online(false));
  }, []);

  // Fecha actual en español
  const today = new Date().toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handle_logout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="app-topbar">
      <span className="topbar-date">{today}</span>

      <div className="topbar-right">
        {is_online !== null && (
          <span className={is_online ? "status-chip" : "status-chip offline"}>
            <span className="status-dot" />
            {is_online ? "Servidor en línea" : "Sin conexión"}
          </span>
        )}

        <div className="topbar-menu">
          <button
            className="topbar-avatar"
            onClick={() => set_is_open(!is_open)}
            title={user.username}
          >
            {user.username.charAt(0).toUpperCase()}
          </button>
          {is_open && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-name">{user.username}</div>
              <button
                onClick={() => {
                  set_is_open(false);
                  navigate("/account");
                }}
              >
                Mi cuenta
              </button>
              <button onClick={handle_logout}>Cerrar sesión</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}