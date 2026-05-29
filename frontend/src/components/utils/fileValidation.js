export const allowedTypes = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf", "text/plain"
];

export const maxSize = 100 * 1024 * 1024;

export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Файл не выбран' };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Недопустимый тип файла. Разрешены: JPG, PNG, GIF, PDF, TXT'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Файл слишком большой.'
    }
  };

  return { valid: true };
};
