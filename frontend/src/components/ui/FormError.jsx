export default function FormError({ error }) {
  if (!error) return null;

  if (typeof error === 'object' && !Array.isArray(error)) {
    const firstErrorKey = Object.keys(error)[0];
    if (firstErrorKey) {
      const firstErrorValue = error[firstErrorKey];
      const message = Array.isArray(firstErrorValue) ? firstErrorValue[0] : firstErrorValue;
      return <div className="invalid-feedback d-block">{message}</div>;
    }
    return null;
  }

  if (Array.isArray(error)) {
    return <div className="invalid-feedback d-block">{error[0]}</div>;
  }

  return <div className="invalid-feedback d-block">{error}</div>;
}