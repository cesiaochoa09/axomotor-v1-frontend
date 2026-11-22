import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../auth/AuthContext";

// Formato del diccionario de datos: +XX-XXX-XXX-XXXX
const PHONE_REGEX = /^\+\d{2}-\d{3}-\d{3}-\d{4}$/;

// Convierte el error del backend en un texto en español para el usuario
function get_error_text(err, fallback) {
  if (!err.response) return "No se pudo conectar con el servidor.";
  const { status, data } = err.response;
  if (status === 409) return "El correo o el teléfono ya están registrados en otra cuenta.";
  if (status === 422) {
    // FastAPI regresa una lista de errores de validación
    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      const fields = data.detail.map((d) => d.loc?.[d.loc.length - 1]).join(", ");
      return `Revisa estos campos: ${fields}.`;
    }
    return "Los datos enviados no son válidos.";
  }
  return fallback;
}

export default function Account() {
  const { user } = useAuth();

  const [profile, set_profile] = useState(null);
  const [is_loading, set_is_loading] = useState(true);
  const [load_error, set_load_error] = useState("");

  // Formulario de correo y teléfono
  const [email, set_email] = useState("");
  const [phone_number, set_phone_number] = useState("");
  const [contact_msg, set_contact_msg] = useState(null);
  const [is_saving_contact, set_is_saving_contact] = useState(false);

  // Formulario de contraseña
  const [current_password, set_current_password] = useState("");
  const [new_password, set_new_password] = useState("");
  const [confirm_password, set_confirm_password] = useState("");
  const [password_msg, set_password_msg] = useState(null);
  const [is_saving_password, set_is_saving_password] = useState(false);

  // Carga los datos del usuario con sesión (el token solo trae el username)
  useEffect(() => {
    async function load_profile() {
      try {
        const { data } = await api.get("/users/");
        const me = data.find((u) => u.username === user.username);
        if (!me) {
          set_load_error("No se encontró tu cuenta.");
          return;
        }
        set_profile(me);
        set_email(me.email);
        set_phone_number(me.phone_number);
      } catch (err) {
        set_load_error(get_error_text(err, "No se pudo cargar tu cuenta."));
      } finally {
        set_is_loading(false);
      }
    }
    load_profile();
  }, [user.username]);

  async function handle_contact_submit(e) {
    e.preventDefault();
    set_contact_msg(null);

    // Valida el formato del teléfono
    if (!PHONE_REGEX.test(phone_number.trim())) {
      set_contact_msg({
        type: "error",
        text: "El teléfono debe tener el formato +52-664-123-4567.",
      });
      return;
    }

    // Solo se envían los campos que cambiaron
    const changes = {};
    if (email.trim() !== profile.email) changes.email = email.trim();
    if (phone_number.trim() !== profile.phone_number)
      changes.phone_number = phone_number.trim();

    if (Object.keys(changes).length === 0) {
      set_contact_msg({ type: "error", text: "No hay cambios que guardar." });
      return;
    }

    set_is_saving_contact(true);
    try {
      const { data } = await api.put(`/users/${profile.user_id}`, changes);
      set_profile(data);
      set_contact_msg({ type: "ok", text: "Datos actualizados correctamente." });
    } catch (err) {
      set_contact_msg({
        type: "error",
        text: get_error_text(err, "No se pudieron guardar los cambios."),
      });
    } finally {
      set_is_saving_contact(false);
    }
  }

  async function handle_password_submit(e) {
    e.preventDefault();
    set_password_msg(null);

    if (new_password.length < 8) {
      set_password_msg({
        type: "error",
        text: "La nueva contraseña debe tener al menos 8 caracteres.",
      });
      return;
    }
    if (new_password.length > 120) {
      set_password_msg({
        type: "error",
        text: "La nueva contraseña no puede tener más de 120 caracteres.",
      });
      return;
    }
    if (new_password !== confirm_password) {
      set_password_msg({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    set_is_saving_password(true);
    try {
      await api.put(`/users/${profile.user_id}/change_password`, {
        current_password,
        new_password,
      });
      set_current_password("");
      set_new_password("");
      set_confirm_password("");
      set_password_msg({ type: "ok", text: "Contraseña actualizada correctamente." });
    } catch (err) {
      // El backend responde 404 cuando la contraseña actual no coincide
      const text =
        err.response?.status === 404
          ? "La contraseña actual es incorrecta."
          : get_error_text(err, "No se pudo cambiar la contraseña.");
      set_password_msg({ type: "error", text });
    } finally {
      set_is_saving_password(false);
    }
  }

  if (is_loading) return <p>Cargando...</p>;
  if (load_error) return <div className="error">{load_error}</div>;

  return (
    <div>
      <h1>Cuenta</h1>
      <p className="muted">
        {profile.first_name} {profile.last_name} · usuario <b>{profile.username}</b>
      </p>

      <form className="card" onSubmit={handle_contact_submit}>
        <h2>Datos de contacto</h2>
        <label>Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => set_email(e.target.value)}
          maxLength={120}
          required
        />
        <label>Número de teléfono</label>
        <input
          value={phone_number}
          onChange={(e) => set_phone_number(e.target.value)}
          placeholder="+52-664-123-4567"
          maxLength={16}
          required
        />
        {contact_msg && (
          <div className={contact_msg.type === "ok" ? "success" : "error"}>
            {contact_msg.text}
          </div>
        )}
        <button className="btn-primary" type="submit" disabled={is_saving_contact}>
          {is_saving_contact ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <form className="card" onSubmit={handle_password_submit}>
        <h2>Cambiar contraseña</h2>
        <label>Contraseña actual</label>
        <input
          type="password"
          value={current_password}
          onChange={(e) => set_current_password(e.target.value)}
          required
        />
        <label>Nueva contraseña</label>
        <input
          type="password"
          value={new_password}
          onChange={(e) => set_new_password(e.target.value)}
          minLength={8}
          maxLength={120}
          required
        />
        <label>Confirmar nueva contraseña</label>
        <input
          type="password"
          value={confirm_password}
          onChange={(e) => set_confirm_password(e.target.value)}
          required
        />
        {password_msg && (
          <div className={password_msg.type === "ok" ? "success" : "error"}>
            {password_msg.text}
          </div>
        )}
        <button className="btn-primary" type="submit" disabled={is_saving_password}>
          {is_saving_password ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}