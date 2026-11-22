import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [is_open, set_is_open] = useState(false);

  // Cierra la sesión y regresa al login
  function handle_logout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-logo">AxoMotor</div>
      <div className="user-menu">
        <button className="user-button" onClick={() => set_is_open(!is_open)}>
          <span className="user-icon">👤</span>
          <span>{user.username}</span>
        </button>
        {is_open && (
          <div className="user-dropdown">
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