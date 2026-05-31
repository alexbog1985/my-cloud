export const FILE_VALIDATION = {
  // Разрешенные типы файлов
  ALLOWED_TYPES: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  // Максимальный размер файла (100MB)
  MAX_SIZE: 100 * 1024 * 1024,
  // Максимальная длина комментария
  MAX_COMMENT_LENGTH: 1000
};

export const isValidFileType = (file) => {
  return FILE_VALIDATION.ALLOWED_TYPES.includes(file.type);
};

export const isValidFileSize = (file) => {
  return file.size <= FILE_VALIDATION.MAX_SIZE;
};

export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'Файл не выбран' };
  }

  if (!isValidFileType(file)) {
    return {
      isValid: false,
      error: `Недопустимый тип файла. Разрешены: ${FILE_VALIDATION.ALLOWED_TYPES.join(', ')}`
    };
  }

  if (!isValidFileSize(file)) {
    const maxSizeMB = FILE_VALIDATION.MAX_SIZE / (1024 * 1024);
    return {
      isValid: false,
      error: `Файл слишком большой. Максимальный размер: ${maxSizeMB}MB`
    };
  }

  return { isValid: true, error: null };
};
