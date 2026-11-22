import { useMemo, useState } from "react";
import api from "../../api/client";
import { format_date, get_error_text, get_license_status } from "./helpers";
import DriverFormModal from "./DriverFormModal";

// Pestaña de conductores: edición de licencia y habilitar/deshabilitar
export default function DriversTab({ drivers, on_changed }) {
  const [search, set_search] = useState("");
  const [editing, set_editing] = useState(null);
  const [action_error, set_action_error] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return drivers;
    return drivers.filter((d) => {
      const name = d.user ? `${d.user.first_name} ${d.user.last_name}` : "";
      return `${name} ${d.license_number}`.toLowerCase().includes(term);
    });
  }, [drivers, search]);

  async function toggle_enabled(d) {
    const action = d.is_enabled ? "deshabilitar" : "habilitar";
    const name = d.user ? `${d.user.first_name} ${d.user.last_name}` : "este conductor";
    if (!window.confirm(`¿Seguro que quieres ${action} a ${name}?`)) return;
    set_action_error("");
    try {
      await api.put(`/drivers/${d.driver_id}`, { is_enabled: !d.is_enabled });
      await on_changed();
    } catch (err) {
      set_action_error(get_error_text(err, `No se pudo ${action} al conductor.`));
    }
  }

  return (
    <div>
      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Buscar por nombre o licencia..."
          value={search}
          onChange={(e) => set_search(e.target.value)}
        />
      </div>
      <p className="muted">
        Para registrar un conductor nuevo, crea un usuario con el rol Conductor en la
        pestaña Usuarios.
      </p>

      {action_error && <div className="error">{action_error}</div>}

      {filtered.length === 0 ? (
        <p className="muted">No hay conductores para mostrar.</p>
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const license = get_license_status(d.license_exp_date);
                return (
                  <tr key={d.driver_id} className="no-click">
                    <td>{d.user ? `${d.user.first_name} ${d.user.last_name}` : "—"}</td>
                    <td>{d.license_number}</td>
                    <td>{d.license_class}</td>
                    <td>{format_date(d.license_exp_date)}</td>
                    <td>
                      <span className={`badge ${license.css}`}>{license.label}</span>
                    </td>
                    <td>
                      <span className={`badge ${d.is_enabled ? "badge-green" : "badge-gray"}`}>
                        {d.is_enabled ? "Habilitado" : "Deshabilitado"}
                      </span>
                    </td>
                    <td className="row-actions">
                      <button className="btn-small" onClick={() => set_editing(d)}>
                        Editar licencia
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => toggle_enabled(d)}
                      >
                        {d.is_enabled ? "Deshabilitar" : "Habilitar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <DriverFormModal
          driver={editing}
          on_close={() => set_editing(null)}
          on_changed={on_changed}
        />
      )}
    </div>
  );
}