export const formatApiError = (apiError) => {
  if (!apiError) return {}

  if (typeof apiError === 'string') return { general: apiError };
  if (typeof apiError === 'object') {
    const errors = {};

    Object.keys(apiError).forEach((key) => {
      const value = Array.isArray(apiError[key]) ? apiError[key][0] : apiError[key];

      if (key === 'non_field_errors') {
        errors.general = value;
      } else {
        errors[key] = value;
      }
    });

    return errors;
  }
  return {};
}