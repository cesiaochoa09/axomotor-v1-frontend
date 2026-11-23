import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [is_open, set_is_open] = useState(false);

  // Fecha actual en español, como en el mockup del documento
  const today = new Date().toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Cierra la sesión y regresa al login
  function handle_logout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <span className="topbar-date">{today}</span>

      <div className="user-menu">
        <button
          className="avatar-button"
          onClick={() => set_is_open(!is_open)}
          title={user.username}
        >
          {user.username.charAt(0).toUpperCase()}
        </button>
        {is_open && (
          <div className="user-dropdown">
            <div className="user-dropdown-name">{user.username}</div>
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
    </header>
  );
}