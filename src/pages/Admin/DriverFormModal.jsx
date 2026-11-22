import { useState } from "react";
import api from "../../api/client";
import { LICENSE_CLASSES, get_error_text } from "./helpers";

// Ventana para editar la licencia de un conductor
export default function DriverFormModal({ driver, on_close, on_changed }) {
  const [form, set_form] = useState({
    license_number: driver.license_number,
    license_class: driver.license_class,
    license_iss_date: driver.license_iss_date,
    license_exp_date: driver.license_exp_date,
  });
  const [error, set_error] = useState("");
  const [is_saving, set_is_saving] = useState(false);

  function update(field, value) {
    set_form((prev) => ({ ...prev, [field]: value }));
  }

  async function handle_submit(e) {
    e.preventDefault();
    set_error("");

    if (form.license_exp_date <= form.license_iss_date) {
      set_error("El vencimiento debe ser posterior a la expedición.");
      return;
    }

    // Solo se envían los campos que cambiaron
    const changes = {};
    for (const field of Object.keys(form)) {
      const value = typeof form[field] === "string" ? form[field].trim() : form[field];
      if (value !== driver[field]) changes[field] = value;
    }
    if (Object.keys(changes).length === 0) {
      set_error("No hay cambios que guardar.");
      return;
    }

    set_is_saving(true);
    try {
      await api.put(`/drivers/${driver.driver_id}`, changes);
      await on_changed();
      on_close();
    } catch (err) {
      set_error(
        get_error_text(
          err,
          "No se pudo guardar la licencia.",
          "El número de licencia ya está registrado."
        )
      );
    } finally {
      set_is_saving(false);
    }
  }

  const name = driver.user ? `${driver.user.first_name} ${driver.user.last_name}` : "Conductor";

  return (
    <div className="modal-backdrop">
      <div className="modal modal-wide">
        <div className="modal-header">
          <h2>Licencia de {name}</h2>
          <button className="modal-close" onClick={on_close} type="button">
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handle_submit}>
          <div className="form-grid">
            <label>
              Número de licencia
              <input
                value={form.license_number}
                onChange={(e) => update("license_number", e.target.value)}
                maxLength={20}
                required
              />
            </label>
            <label>
              Clase
              <select
                value={form.license_class}
                onChange={(e) => update("license_class", e.target.value)}
              >
                {LICENSE_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fecha de expedición
              <input
                type="date"
                value={form.license_iss_date}
                onChange={(e) => update("license_iss_date", e.target.value)}
                required
              />
            </label>
            <label>
              Fecha de vencimiento
              <input
                type="date"
                value={form.license_exp_date}
                onChange={(e) => update("license_exp_date", e.target.value)}
                required
              />
            </label>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={on_close}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={is_saving}>
              {is_saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}