import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";

// Convierte "2027-03-15" en una fecha local (evita desfase por zona horaria)
function parse_date(value) {
  return new Date(`${value}T00:00:00`);
}

function format_date(value) {
  return parse_date(value).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Calcula el estado de vigencia de la licencia
function get_license_status(exp_date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = parse_date(exp_date);
  const days_left = Math.round((exp - today) / (1000 * 60 * 60 * 24));

  if (days_left < 0) return { label: "Vencida", css: "badge-red" };
  if (days_left <= 30) return { label: "Por vencer", css: "badge-yellow" };
  return { label: "Vigente", css: "badge-green" };
}

function get_error_text(err) {
  if (!err.response) return "No se pudo conectar con el servidor.";
  return "No se pudo cargar la lista de conductores.";
}

export default function Drivers() {
  const [drivers, set_drivers] = useState([]);
  const [is_loading, set_is_loading] = useState(true);
  const [error, set_error] = useState("");
  const [search, set_search] = useState("");
  const [selected, set_selected] = useState(null);

  // Carga conductores y usuarios al mismo tiempo, y los une por user_id
  useEffect(() => {
    async function load_data() {
      try {
        const [drivers_res, users_res] = await Promise.all([
          api.get("/drivers/"),
          api.get("/users/"),
        ]);
        const users_by_id = new Map(users_res.data.map((u) => [u.user_id, u]));
        const merged = drivers_res.data.map((d) => ({
          ...d,
          user: users_by_id.get(d.user_id) ?? null,
        }));
        set_drivers(merged);
      } catch (err) {
        set_error(get_error_text(err));
      } finally {
        set_is_loading(false);
      }
    }
    load_data();
  }, []);

  // Filtra por nombre, número de licencia o correo
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return drivers;
    return drivers.filter((d) => {
      const full_name = d.user ? `${d.user.first_name} ${d.user.last_name}` : "";
      return (
        full_name.toLowerCase().includes(term) ||
        d.license_number.toLowerCase().includes(term) ||
        (d.user?.email ?? "").toLowerCase().includes(term)
      );
    });
  }, [drivers, search]);

  if (is_loading) return <p>Cargando...</p>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h1>Conductores</h1>
      <p className="muted">Consulta la información de los conductores registrados.</p>

      <input
        className="search-input"
        placeholder="Buscar por nombre, licencia o correo..."
        value={search}
        onChange={(e) => set_search(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="muted">
          {drivers.length === 0
            ? "Todavía no hay conductores registrados."
            : "Ningún conductor coincide con la búsqueda."}
        </p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Licencia</th>
                <th>Clase</th>
                <th>Vence</th>
                <th>Vigencia</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const license = get_license_status(d.license_exp_date);
                return (
                  <tr key={d.driver_id} onClick={() => set_selected(d)}>
                    <td>
                      {d.user ? `${d.user.first_name} ${d.user.last_name}` : "—"}
                    </td>
                    <td>{d.license_number}</td>
                    <td>{d.license_class}</td>
                    <td>{format_date(d.license_exp_date)}</td>
                    <td>
                      <span className={`badge ${license.css}`}>{license.label}</span>
                    </td>
                    <td>
                      {!d.is_enabled ? (
                        <span className="badge badge-gray">Deshabilitado</span>
                      ) : d.is_active ? (
                        <span className="badge badge-green">En servicio</span>
                      ) : (
                        <span className="badge badge-blue">Disponible</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <DriverDetail driver={selected} on_close={() => set_selected(null)} />
      )}
    </div>
  );
}

// Ventana con toda la información de un conductor
function DriverDetail({ driver, on_close }) {
  const license = get_license_status(driver.license_exp_date);
  const user = driver.user;

  return (
    <div className="modal-backdrop" onClick={on_close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{user ? `${user.first_name} ${user.last_name}` : "Conductor"}</h2>
          <button className="modal-close" onClick={on_close}>
            ✕
          </button>
        </div>

        <h3>Contacto</h3>
        <dl className="detail-list">
          <dt>Correo</dt>
          <dd>{user?.email ?? "—"}</dd>
          <dt>Teléfono</dt>
          <dd>{user?.phone_number ?? "—"}</dd>
          <dt>Usuario</dt>
          <dd>{user?.username ?? "—"}</dd>
        </dl>

        <h3>Licencia de conducir</h3>
        <dl className="detail-list">
          <dt>Número</dt>
          <dd>{driver.license_number}</dd>
          <dt>Clase</dt>
          <dd>{driver.license_class}</dd>
          <dt>Expedición</dt>
          <dd>{format_date(driver.license_iss_date)}</dd>
          <dt>Vencimiento</dt>
          <dd>
            {format_date(driver.license_exp_date)}{" "}
            <span className={`badge ${license.css}`}>{license.label}</span>
          </dd>
        </dl>

        <h3>Estado</h3>
        <dl className="detail-list">
          <dt>Cuenta</dt>
          <dd>{driver.is_enabled ? "Habilitada" : "Deshabilitada"}</dd>
          <dt>En servicio</dt>
          <dd>{driver.is_active ? "Sí" : "No"}</dd>
          <dt>Telegram</dt>
          <dd>{driver.telegram_user_id ? "Vinculado" : "Sin vincular"}</dd>
          <dt>Registrado</dt>
          <dd>{format_date(driver.registered_at.slice(0, 10))}</dd>
        </dl>
      </div>
    </div>
  );
}