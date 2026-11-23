import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

// Estructura general: barra lateral a la izquierda; a la derecha, cabecera y contenido
export default function Layout() {
  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Navbar />
        <main className="shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}