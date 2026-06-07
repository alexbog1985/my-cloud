/**
 * Файл с константами для тестов
 */

// Mock данные для тестов
const MOCK_USER_ID = 'user123';

const MOCK_FILES = [
  { id: 1, name: 'test1.txt', original_name: 'test1.txt', comment: null },
  { id: 2, name: 'test2.txt', original_name: 'test2.txt', comment: 'My file' },
];

const MOCK_FILE = {
  id: 1,
  name: 'test.txt',
  original_name: 'test.txt',
  comment: 'Test comment',
  special_link: 'abc123',
};

const MOCK_ERROR_RESPONSES = {
  NOT_FOUND: {
    response: {
      status: 404,
      data: { detail: 'Файл не найден' },
    },
  },
  UNAUTHORIZED: {
    response: {
      status: 401,
      data: { detail: 'Unauthorized' },
    },
  },
  VALIDATION_ERROR: {
    response: {
      status: 400,
      data: { error: 'Валидационная ошибка' },
    },
  },
  SERVER_ERROR: {
    response: {
      status: 500,
      data: { detail: 'Ошибка сервера' },
    },
  },
};

// URL endpoints
const ENDPOINTS = {
  FILES: '/files/',
  TOKEN_REFRESH: '/token/refresh/',
};

// Mock responses
const MOCK_RESPONSES = {
  FILES_LIST: { data: MOCK_FILES },
  FILE_DETAIL: { data: MOCK_FILE },
  FILE_UPLOAD: { data: { id: 1, name: 'test.txt', original_name: 'test.txt' } },
  FILE_UPDATE: { data: { id: 1, name: 'updated.txt', comment: 'Updated' } },
  EMPTY: { data: {} },
  NO_SPECIAL_LINK: { data: { id: 1, name: 'test.txt', special_link: null } },
};

module.exports = {
  MOCK_USER_ID,
  MOCK_FILES,
  MOCK_FILE,
  MOCK_ERROR_RESPONSES,
  ENDPOINTS,
  MOCK_RESPONSES,
};
