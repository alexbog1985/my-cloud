const { renderHook } = require('@testing-library/react');

// Импорты после моков
const { useApiErrorHandler } = require('../../src/hooks/useApiErrorHandler');
const { useNotifications } = require('../../src/hooks/useNotifications');

// Моки для зависимостей
jest.mock('../../src/hooks/useNotifications');

const mockErrorFn = jest.fn();
const mockSuccessFn = jest.fn();

describe('useApiErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('хук должен быть определен', () => {
    expect(useApiErrorHandler).toBeDefined();
  });

  test('должен возвращать функцию errorHandler', () => {
    useNotifications.mockReturnValue({ error: mockErrorFn, success: mockSuccessFn });

    const { result } = renderHook(() => useApiErrorHandler());

    expect(typeof result.current).toBe('function');
  });

  describe('errorHandler', () => {
    test('должен возвращать сообщение из err.response.data.detail', () => {
      // Given
      useNotifications.mockReturnValue({ error: mockErrorFn, success: mockSuccessFn });

      const mockError = {
        response: { data: { detail: 'Пользователь не найден' } },
      };

      const { result } = renderHook(() => useApiErrorHandler());

      // When
      const message = result.current(mockError);

      // Then
      expect(message).toBe('Пользователь не найден');
      expect(mockErrorFn).toHaveBeenCalledWith('Пользователь не найден');
    });

    test('должен использовать err.response.data.error если нет detail', () => {
      // Given
      useNotifications.mockReturnValue({ error: mockErrorFn, success: mockSuccessFn });

      const mockError = {
        response: { data: { error: 'Ошибка сервера' } },
      };

      const { result } = renderHook(() => useApiErrorHandler());

      // When
      const message = result.current(mockError);

      // Then
      expect(message).toBe('Ошибка сервера');
      expect(mockErrorFn).toHaveBeenCalledWith('Ошибка сервера');
    });

    test('должен использовать err.response.data.file[0] если нет detail и error', () => {
      // Given
      useNotifications.mockReturnValue({ error: mockErrorFn, success: mockSuccessFn });

      const mockError = {
        response: { data: { file: ['Файл не указан'] } },
      };

      const { result } = renderHook(() => useApiErrorHandler());

      // When
      const message = result.current(mockError);

      // Then
      expect(message).toBe('Файл не указан');
      expect(mockErrorFn).toHaveBeenCalledWith('Файл не указан');
    });

    test('должен использовать err.message если нет response.data', () => {
      // Given
      useNotifications.mockReturnValue({ error: mockErrorFn, success: mockSuccessFn });

      const mockError = new Error('Network error');

      const { result } = renderHook(() => useApiErrorHandler());

      // When
      const message = result.current(mockError);

      // Then
      expect(message).toBe('Network error');
      expect(mockErrorFn).toHaveBeenCalledWith('Network error');
    });

    test('должен использовать defaultMessage если нет ошибки', () => {
      // Given
      useNotifications.mockReturnValue({ error: mockErrorFn, success: mockSuccessFn });

      const mockError = {};

      const { result } = renderHook(() => useApiErrorHandler());

      // When
      const message = result.current(mockError);

      // Then
      expect(message).toBe('Неизвестная ошибка');
      expect(mockErrorFn).toHaveBeenCalledWith('Неизвестная ошибка');
    });

    test('должен добавлять context к сообщению', () => {
      // Given
      useNotifications.mockReturnValue({ error: mockErrorFn, success: mockSuccessFn });

      const mockError = {
        response: { data: { detail: 'Ошибка' } },
      };

      const { result } = renderHook(() => useApiErrorHandler('Auth'));

      // When
      const message = result.current(mockError);

      // Then
      expect(message).toBe('Ошибка');
      expect(mockErrorFn).toHaveBeenCalledWith('Auth: Ошибка');
    });

    test('должен использовать file array для сообщения', () => {
      // Given
      useNotifications.mockReturnValue({ error: mockErrorFn, success: mockSuccessFn });

      const mockError = {
        response: { data: { file: ['Недопустимый тип файла', 'Слишком большой размер'] } },
      };

      const { result } = renderHook(() => useApiErrorHandler());

      // When
      const message = result.current(mockError);

      // Then
      expect(message).toBe('Недопустимый тип файла');
      expect(mockErrorFn).toHaveBeenCalledWith('Недопустимый тип файла');
    });

    test('должен обрабатывать ошибки без response', () => {
      // Given
      useNotifications.mockReturnValue({ error: mockErrorFn, success: mockSuccessFn });

      const mockError = { message: 'Connection timeout' };

      const { result } = renderHook(() => useApiErrorHandler());

      // When
      const message = result.current(mockError);

      // Then
      expect(message).toBe('Connection timeout');
      expect(mockErrorFn).toHaveBeenCalledWith('Connection timeout');
    });

    test('должен обрабатывать частичные ошибки response', () => {
      // Given
      useNotifications.mockReturnValue({ error: mockErrorFn, success: mockSuccessFn });

      const mockError = { response: { data: {} } };

      const { result } = renderHook(() => useApiErrorHandler());

      // When
      const message = result.current(mockError);

      // Then
      expect(message).toBe('Неизвестная ошибка');
      expect(mockErrorFn).toHaveBeenCalledWith('Неизвестная ошибка');
    });
  });
});
