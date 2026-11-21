import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <h1>Inicio</h1>
      <p>
        Sesión iniciada como <b>{user.username}</b> (rol: {user.role})
      </p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}