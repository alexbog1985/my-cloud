export default function FormError({ error }) {
  if (!error) return null;

  let message = '';

  if (typeof error === 'string') {
    message = error;
  } else if (Array.isArray(error)) {
    message = error[0];
  } else if (typeof error === 'object') {
    const firstKey = Object.keys(error)[0];
    if (firstKey) {
      const firstValue = error[firstKey];
      // Если значение - объект, рекурсивно извлекаем сообщение
      if (typeof firstValue === 'object' && !Array.isArray(firstValue)) {
        message = FormError({ error: firstValue });
      } else {
        message = Array.isArray(firstValue) ? firstValue[0] : firstValue;
      }
    }
  }

  return message ? <div className="invalid-feedback d-block">{message}</div> : null;
}
