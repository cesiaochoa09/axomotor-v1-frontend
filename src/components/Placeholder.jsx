// Texto temporal para las secciones que aún no se desarrollan
export default function Placeholder({ title, description }) {
  return (
    <div>
      <h1>{title}</h1>
      <p style={{ color: "#666" }}>{description}</p>
      <p style={{ color: "#999" }}>🚧 Sección pendiente de desarrollar.</p>
    </div>
  );
}