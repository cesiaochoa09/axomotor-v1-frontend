import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { get_license_status } from "../Admin/helpers";

// Etiquetas y colores de los estados de incidencia del backend
const INCIDENT_STATUS = {
  OPEN: { label: "Abierta", css: "badge-red" },
  IN_REVISION: { label: "En revisión", css: "badge-yellow" },
  CLOSED: { label: "Cerrada", css: "badge-green" },
  DISCARDED: { label: "Descartada", css: "badge-gray" },
};

const ROLE_LABELS = {
  ADMIN: "Administrador",
  DRIVER: "Conductor",
  AGENT: "Agente",
};

// Accesos rápidos (los enlaces de admin solo se muestran a administradores)
const QUICK_ACTIONS = [
  { to: "/trips", label: "Crear un viaje", icon: "➕" },
  { to: "/trips", label: "Dar seguimiento", icon: "📍" },
  { to: "/incidents", label: "Historial de incidencias", icon: "⚠️" },
  { to: "/incidents", label: "Historial de eventos", icon: "📋" },
  { to: "/admin", label: "Administración", icon: "🛠️", admin_only: true },
];

function QuickActions({ role }) {
  return (
    <div className="quick-actions">
      {QUICK_ACTIONS.filter((a) => !a.admin_only || role === "ADMIN").map((a) => (
        <Link key={a.label} to={a.to} className="quick-action">
          <span>{a.icon}</span>
          {a.label}
        </Link>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const is_staff = user.role === "ADMIN" || user.role === "AGENT";

  return (
    <div>
      <h1>Hola, {user.username}</h1>
      <p className="muted">Sesión como {ROLE_LABELS[user.role] ?? user.role}.</p>

      <QuickActions role={user.role} />

      {is_staff ? (
        <StaffOverview />
      ) : (
        <p className="muted">
          Desde el menú puedes consultar tus viajes, vehículos e incidencias.
        </p>
      )}
    </div>
  );
}

// KPIs y últimas incidencias (solo admin y agente)
function StaffOverview() {
  const [kpis, set_kpis] = useState(null);
  const [kpi_error, set_kpi_error] = useState("");
  const [incidents, set_incidents] = useState([]);
  const [incidents_available, set_incidents_available] = useState(true);

  useEffect(() => {
    async function load_kpis() {
      try {
        const [users_res, drivers_res] = await Promise.all([
          api.get("/users/"),
          api.get("/drivers/"),
        ]);
        const licenses = drivers_res.data.map((d) => get_license_status(d.license_exp_date));
        set_kpis({
          enabled_users: users_res.data.filter((u) => u.is_enabled).length,
          drivers: drivers_res.data.length,
          drivers_active: drivers_res.data.filter((d) => d.is_active).length,
          expiring: licenses.filter((l) => l.label === "Por vencer").length,
          expired: licenses.filter((l) => l.label === "Vencida").length,
        });
      } catch (err) {
        set_kpi_error(
          err.response ? "No se pudieron cargar los indicadores." : "No se pudo conectar con el servidor."
        );
      }
    }

    // El endpoint de incidencias aún no existe en el backend: si responde error,
    // se muestra un aviso en lugar de la tabla
    async function load_incidents() {
      try {
        const { data } = await api.get("/incidents/");
        const sorted = [...data].sort(
          (a, b) => new Date(b.registered_at) - new Date(a.registered_at)
        );
        set_incidents(sorted.slice(0, 5));
      } catch {
        set_incidents_available(false);
      }
    }

    load_kpis();
    load_incidents();
  }, []);

  return (
    <>
      <h2 className="section-title">Indicadores</h2>
      {kpi_error && <div className="error">{kpi_error}</div>}
      {!kpi_error && !kpis && <p>Cargando...</p>}
      {kpis && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Usuarios habilitados</span>
            <span className="kpi-value">{kpis.enabled_users}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Conductores registrados</span>
            <span className="kpi-value">{kpis.drivers}</span>
            <span className="kpi-note">{kpis.drivers_active} en servicio</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Licencias por vencer (30 días)</span>
            <span className="kpi-value">{kpis.expiring}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Licencias vencidas</span>
            <span className={kpis.expired > 0 ? "kpi-value kpi-alert" : "kpi-value"}>
              {kpis.expired}
            </span>
          </div>
        </div>
      )}

      <h2 className="section-title">Últimas incidencias</h2>
      {!incidents_available ? (
        <p className="muted">
          Las incidencias estarán disponibles cuando el servidor tenga ese módulo.
        </p>
      ) : incidents.length === 0 ? (
        <p className="muted">No hay incidencias registradas.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Registrada</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((i) => {
                const status = INCIDENT_STATUS[i.status] ?? { label: i.status, css: "badge-gray" };
                return (
                  <tr key={i.incident_id} className="no-click">
                    <td>{i.code}</td>
                    <td>{i.description ?? "—"}</td>
                    <td>
                      <span className={`badge ${status.css}`}>{status.label}</span>
                    </td>
                    <td>{new Date(i.registered_at).toLocaleString("es-MX")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}