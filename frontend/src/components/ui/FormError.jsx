export default function FormError({ error }) {
  if (!error) return null;

  const message = Array.isArray(error) ? error[0] : error;

  if (!message) return null;

  return <div className="invalid-feedback d-block">{message}</div>
}