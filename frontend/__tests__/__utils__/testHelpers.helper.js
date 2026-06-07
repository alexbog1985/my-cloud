/**
 * Файл с утилитами для тестирования
 * Содержит reusable helpers и mocks
 */

const { renderHook } = require('@testing-library/react');

// Helper для создания мока dispatch
const createMockDispatch = () => jest.fn();

// Helper для создания мока request из useApi
const createMockRequest = (mockResponse = {}) => {
  return jest.fn().mockResolvedValue(mockResponse);
};

// Helper для создания мока ошибки
const createMockError = (response = {}) => ({
  response: {
    data: { detail: 'Unauthorized', ...response.data },
    status: 401,
    ...response,
  },
});

// Helper для мокирования localStorage
const mockLocalStorage = (items = {}) => {
  const localStorageMock = {};

  Object.keys(items).forEach(key => {
    localStorageMock[key] = JSON.stringify(items[key]);
  });

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn((key) => localStorageMock[key] ?? null),
      setItem: jest.fn((key, value) => {
        localStorageMock[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete localStorageMock[key];
      }),
      clear: jest.fn(() => {
        Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
      }),
    },
    writable: true,
  });

  return {
    restore: () => {
      delete window.localStorage;
    },
  };
};

// Helper для создания мока notifications
const createMockNotifications = (overrides = {}) => ({
  error: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  addNotificationAction: jest.fn(),
  removeNotification: jest.fn(),
  clear: jest.fn(),
  notifications: [],
  ...overrides,
});

// Helper для создания мока apiErrorHandler
const createMockApiErrorHandler = (overrides = {}) => {
  const errorHandler = jest.fn((err, context) => {
    const message = err?.response?.data?.detail ||
                    err?.response?.data?.error ||
                    (Array.isArray(err?.response?.data?.file) ? err.response.data.file[0] : '') ||
                    err?.message ||
                    'Неизвестная ошибка';

    const fullMessage = context ? `${context}: ${message}` : message;

    if (errorHandler.mockImplementation) {
      errorHandler.mockImplementation(() => fullMessage);
    }

    return fullMessage;
  });

  return { ...createMockNotifications({ error: errorHandler }), ...overrides };
};

// Helper для renderHook с преднастроенным окружением
const renderHookWithMocks = (hookFn, mockProviders = {}) => {
  const {
    useApiMock = { request: jest.fn() },
    useNotificationsMock = createMockNotifications(),
    useApiErrorHandlerMock = jest.fn(),
    useDispatchMock = jest.fn(),
    ...restMocks
  } = mockProviders;

  // Применяем моки
  jest.mock('../../../src/hooks/useApi', () => ({
    useApi: jest.fn().mockReturnValue(useApiMock),
  }));

  jest.mock('../../../src/hooks/useNotifications', () => ({
    useNotifications: jest.fn().mockReturnValue(useNotificationsMock),
  }));

  jest.mock('../../../src/hooks/useApiErrorHandler', () => ({
    useApiErrorHandler: jest.fn().mockReturnValue(useApiErrorHandlerMock),
  }));

  jest.mock('react-redux', () => ({
    useDispatch: jest.fn().mockReturnValue(useDispatchMock),
    useSelector: jest.fn().mockReturnValue({ notifications: [] }),
  }));

  return renderHook(hookFn, restMocks);
};

// Helper для очистки всех моков
const clearAllMocks = () => {
  jest.clearAllMocks();
  // Очищаем моки localStorage
  if (window.localStorage && window.localStorage.clear) {
    window.localStorage.clear();
  }
};

// Helper для создания тестового файла
const createTestFile = (content = 'test content', fileName = 'test.txt', fileType = 'text/plain') => {
  return new File([content], fileName, { type: fileType });
};

// Helper для мокирования clipboard API
const mockClipboard = () => {
  const writeTextMock = jest.fn().mockResolvedValue(undefined);

  navigator.clipboard = {
    writeText: writeTextMock,
  };

  return {
    writeText: writeTextMock,
    restore: () => {
      delete navigator.clipboard;
    },
  };
};

// Helper для мокирования setTimeout/setInterval
const withFakeTimers = (callback) => {
  jest.useFakeTimers();
  try {
    callback();
  } finally {
    jest.useRealTimers();
  }
};

// Helper для тестирования асинхронных операций
const awaitAsync = async (promise) => {
  await expect(promise).resolves;
};

// Helper для тестирования ошибок
const expectRejects = async (promise) => {
  await expect(promise).rejects;
};

module.exports = {
  createMockDispatch,
  createMockRequest,
  createMockError,
  mockLocalStorage,
  createMockNotifications,
  createMockApiErrorHandler,
  renderHookWithMocks,
  clearAllMocks,
  createTestFile,
  mockClipboard,
  withFakeTimers,
  awaitAsync,
  expectRejects,
};
