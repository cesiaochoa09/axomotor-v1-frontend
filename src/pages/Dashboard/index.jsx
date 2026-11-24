import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { get_license_status } from "../Admin/helpers";
import { WelcomeBanner, AccessCards } from "./Welcome";

// Etiqueta y punto de color de cada estado de incidencia del backend
const INCIDENT_STATUS = {
  OPEN: { label: "Abierta", dot: "high" },
  IN_REVISION: { label: "En revisión", dot: "mid" },
  CLOSED: { label: "Cerrada", dot: "low" },
  DISCARDED: { label: "Descartada", dot: "low" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const is_staff = user.role === "ADMIN" || user.role === "AGENT";

  return (
    <div className="page">
      <WelcomeBanner user={user} />
      {is_staff && <StaffOverview />}
      <AccessCards role={user.role} />
    </div>
  );
}

// KPIs, mapa y últimas incidencias (solo admin y agente)
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
    // se muestra un aviso en lugar de la lista
    async function load_incidents() {
      try {
        const { data } = await api.get("/incidents/");
        const sorted = [...data].sort(
          (a, b) => new Date(b.registered_at) - new Date(a.registered_at)
        );
        set_incidents(sorted.slice(0, 4));
      } catch {
        set_incidents_available(false);
      }
    }

    load_kpis();
    load_incidents();
  }, []);

  return (
    <>
      {kpi_error && <div className="error">{kpi_error}</div>}
      {!kpi_error && !kpis && <p>Cargando...</p>}
      {kpis && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Usuarios habilitados</span>
            <span className="kpi-value">{kpis.enabled_users}</span>
            <span className="kpi-pill">Cuentas activas</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Conductores registrados</span>
            <span className="kpi-value">{kpis.drivers}</span>
            <span className="kpi-pill">{kpis.drivers_active} en servicio</span>
          </div>
          <div className={kpis.expiring > 0 ? "kpi-card kpi-warn" : "kpi-card"}>
            <span className="kpi-label">Licencias por vencer (30 días)</span>
            <span className="kpi-value">{kpis.expiring}</span>
            <span className="kpi-pill">{kpis.expiring > 0 ? "Revisar pronto" : "Sin pendientes"}</span>
          </div>
          {/* El rojo solo aparece cuando hay licencias vencidas */}
          <div className={kpis.expired > 0 ? "kpi-card kpi-alert" : "kpi-card"}>
            <span className="kpi-label">Licencias vencidas</span>
            <span className="kpi-value">{kpis.expired}</span>
            <span className="kpi-pill">{kpis.expired > 0 ? "Requiere atención" : "Todo al día"}</span>
          </div>
        </div>
      )}

      <div className="dash-grid">
        <section className="card map-card">
          <div className="card-header">
            <h2>Ubicación en tiempo real</h2>
          </div>
          <div className="map-placeholder">
            {/* Dibujo decorativo: el mapa real llega con el módulo de Viajes */}
            <svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <rect width="600" height="300" fill="#f1e6ea" />
              <rect x="30" y="30" width="180" height="90" rx="14" fill="#e6d3d9" />
              <rect x="250" y="30" width="140" height="90" rx="14" fill="#d4e3cf" />
              <rect x="430" y="30" width="140" height="90" rx="14" fill="#e6d3d9" />
              <rect x="30" y="160" width="180" height="80" rx="14" fill="#e6d3d9" />
              <rect x="250" y="160" width="320" height="80" rx="14" fill="#e6d3d9" />
              <path d="M0 270C120 250 260 290 380 270S520 255 600 270V300H0Z" fill="#c9dbe6" />
              <path d="M0 140H600M225 0V300M410 0V300" stroke="#fff" strokeWidth="14" fill="none" />
            </svg>
            <p className="map-note">
              El mapa en vivo estará disponible cuando el módulo de Viajes esté conectado.
            </p>
          </div>
        </section>

        <section className="card alerts-card">
          <div className="card-header">
            <h2>Alertas recientes</h2>
          </div>
          {!incidents_available ? (
            <p className="muted">
              Las incidencias estarán disponibles cuando el servidor tenga ese módulo.
            </p>
          ) : incidents.length === 0 ? (
            <p className="muted">No hay incidencias registradas.</p>
          ) : (
            incidents.map((i) => {
              const status = INCIDENT_STATUS[i.status] ?? { label: i.status, dot: "low" };
              return (
                <div key={i.incident_id} className="alert-item">
                  <span className={`alert-dot ${status.dot}`} />
                  <div>
                    <div className="alert-title">{i.description ?? i.code}</div>
                    <div className="alert-sub">
                      {i.code} · {status.label} ·{" "}
                      {new Date(i.registered_at).toLocaleString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <Link to="/incidents" className="btn-outline">
            Ver todas las alertas
          </Link>
        </section>
      </div>
    </>
  );
}