import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

// Estructura general: barra lateral a la izquierda; a la derecha, cabecera y contenido
export default function Layout() {
  return (
<div className="app-shell" style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
<div className="app-main" style={{ flex: 1, minWidth: 0 }}>
            <Navbar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}