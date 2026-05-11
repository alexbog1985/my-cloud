const patterns = {
  username: /^[a-zA-Z][a-zA-Z0-9]{3,19}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
};

const messages = {
  required: 'Это поле обязательно для заполнения',
  username: 'Логин должен содержать 4-20 символов, начинаться с буквы и содержать только латинские буквы и цифры',
  email: 'Введите корректный email адрес',
  password: 'Пароль должен содержать минимум 6 символов, одну заглавную букву, одну цифру и один специальный символ',
  password_match: 'Пароли не совпадают'
};

export const validateField = (name, value, formData = {}) => {
  if (!value.trim()) return messages.required
  if (patterns[name] && !patterns[name].test(value)) return messages[name];
  if (name === 'password_confirm' && value !== formData.password) return messages.password_match;

  return null;
};

export const validateForm = (formData, fields) => {
  const errors = {};
  let isValid = true;

  fields.forEach(field => {
    const error = validateField(field.name, formData[field.name], formData)
    if (error) {
      errors[field.name] = error;
      isValid = false;
    }
  });

  return { errors, isValid }
};
