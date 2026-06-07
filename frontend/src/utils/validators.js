export const AUTH_FIELD_NAMES = [
  'username', 'first_name', 'last_name', 'email', 'password', 'password_confirm'
];

export const PATTERN_USERNAME = /^[a-zA-Z][a-zA-Z0-9]{3,19}$/;
export const PATTERN_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PATTERN_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const MESSAGES = {
  required: 'Это поле обязательно для заполнения',
  username: 'Логин должен содержать 4-20 символов, начинаться с буквы и содержать только латинские буквы и цифры',
  email: 'Введите корректный email адрес',
  password: 'Пароль должен содержать минимум 6 символов, одну заглавную букву, одну цифру и один специальный символ',
  password_match: 'Пароли не совпадают'
};

export const validateField = (name, value, formData = {}) => {
  if (!value.trim()) return MESSAGES.required;

  switch (name) {
    case 'username':
      if (!PATTERN_USERNAME.test(value)) return MESSAGES.username;
      break;
    case 'email':
      if (!PATTERN_EMAIL.test(value)) return MESSAGES.email;
      break;
    case 'password':
      if (!PATTERN_PASSWORD.test(value)) return MESSAGES.password;
      break;
    case 'password_confirm':
      if (value !== formData.password) return MESSAGES.password_match;
      break;
  }
  return null;
};

export const validateForm = (formData, fields) => {
  const errors = {};
  let isValid = true;

  fields.forEach(field => {
    const error = validateField(field.name, formData[field.name], formData);
    if (error) {
      errors[field.name] = error;
      isValid = false;
    }
  });

  return { errors, isValid };
};
