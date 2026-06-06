import { renderHook } from '@testing-library/react';

// Моки для зависимостей ДО импорта useApiErrorHandler
jest.mock('../../src/hooks/useNotifications');

// Импорт после моков
import { useApiErrorHandler } from '../../src/hooks/useApiErrorHandler';
import { useNotifications } from '../../src/hooks/useNotifications';

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
    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: jest.fn()
    });

    const { result } = renderHook(() => useApiErrorHandler());

    expect(typeof result.current).toBe('function');
  });

  test('errorHandler должен возвращать сообщение из err.response.data.detail', () => {
    const mockError = {
      response: {
        data: {
          detail: 'Пользователь не найден'
        }
      }
    };
    const mockErrorFn = jest.fn();

    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: mockErrorFn
    });

    const { result } = renderHook(() => useApiErrorHandler());

    const message = result.current(mockError);

    expect(message).toBe('Пользователь не найден');
    expect(mockErrorFn).toHaveBeenCalledWith('Пользователь не найден');
  });

  test('errorHandler должен использовать err.response.data.error если нет detail', () => {
    const mockError = {
      response: {
        data: {
          error: 'Ошибка сервера'
        }
      }
    };
    const mockErrorFn = jest.fn();

    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: mockErrorFn
    });

    const { result } = renderHook(() => useApiErrorHandler());

    const message = result.current(mockError);

    expect(message).toBe('Ошибка сервера');
    expect(mockErrorFn).toHaveBeenCalledWith('Ошибка сервера');
  });

  test('errorHandler должен использовать err.response.data.file[0] если нет detail и error', () => {
    const mockError = {
      response: {
        data: {
          file: ['Файл не указан']
        }
      }
    };
    const mockErrorFn = jest.fn();

    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: mockErrorFn
    });

    const { result } = renderHook(() => useApiErrorHandler());

    const message = result.current(mockError);

    expect(message).toBe('Файл не указан');
    expect(mockErrorFn).toHaveBeenCalledWith('Файл не указан');
  });

  test('errorHandler должен использовать err.message если нет response.data', () => {
    const mockError = new Error('Network error');
    const mockErrorFn = jest.fn();

    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: mockErrorFn
    });

    const { result } = renderHook(() => useApiErrorHandler());

    const message = result.current(mockError);

    expect(message).toBe('Network error');
    expect(mockErrorFn).toHaveBeenCalledWith('Network error');
  });

  test('errorHandler должен использовать defaultMessage если нет ошибки', () => {
    const mockError = {};
    const mockErrorFn = jest.fn();

    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: mockErrorFn
    });

    const { result } = renderHook(() => useApiErrorHandler());

    const message = result.current(mockError);

    expect(message).toBe('Неизвестная ошибка');
    expect(mockErrorFn).toHaveBeenCalledWith('Неизвестная ошибка');
  });

  test('errorHandler должен добавлять context к сообщению', () => {
    const mockError = {
      response: {
        data: {
          detail: 'Ошибка'
        }
      }
    };
    const mockErrorFn = jest.fn();

    require('../../src/hooks/useNotifications').useNotifications.mockReturnValue({
      error: mockErrorFn
    });

    const { result } = renderHook(() => useApiErrorHandler('Auth'));

    const message = result.current(mockError);

    expect(message).toBe('Ошибка');
    expect(mockErrorFn).toHaveBeenCalledWith('Auth: Ошибка');
  });
});
