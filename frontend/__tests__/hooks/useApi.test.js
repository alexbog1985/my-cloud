import { renderHook, waitFor } from '@testing-library/react';

// Моки для зависимостей ДО импорта useApi
jest.mock('../services/api');
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

// Импорт после моков
import { useApi } from '../../src/hooks/useApi';
import { logout, updateToken } from '../../src/store/slices/authSlice';
import api from '../../src/services/api';

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('хук должен быть определен', () => {
    expect(useApi).toBeDefined();
  });

  test('должен возвращать метод request', () => {
    require('react-redux').useDispatch.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useApi());

    expect(result.current).toHaveProperty('request');
  });

  test('request должен возвращать результат API вызова', async () => {
    const mockApi = jest.fn().mockResolvedValue({ data: { success: true } });
    api.mockImplementation(mockApi);
    require('react-redux').useDispatch.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useApi());

    const response = await result.current.request({ url: '/test/', method: 'GET' });

    expect(response).toEqual({ data: { success: true } });
    expect(mockApi).toHaveBeenCalledWith({ url: '/test/', method: 'GET' });
  });

  test('request должен logout если нет refresh token', async () => {
    const mockApi = jest.fn().mockRejectedValue({
      response: { status: 401, data: { detail: 'Unauthorized' } }
    });

    api.mockImplementation(mockApi);
    require('react-redux').useDispatch.mockReturnValue(jest.fn());

    const originalLocalStorage = global.localStorage;
    global.localStorage = {
      getItem: jest.fn().mockReturnValue(null)
    };

    const { result } = renderHook(() => useApi());

    await expect(result.current.request({ url: '/test/', method: 'GET' }))
      .rejects
      .toEqual({ response: { status: 401, data: { detail: 'Unauthorized' } } });

    expect(require('react-redux').useDispatch()).toHaveBeenCalledWith(logout());

    global.localStorage = originalLocalStorage;
  });

  test('request должен прокидывать ошибки', async () => {
    const mockError = new Error('Network error');
    const mockApi = jest.fn().mockRejectedValue(mockError);

    api.mockImplementation(mockApi);
    require('react-redux').useDispatch.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useApi());

    await expect(result.current.request({ url: '/test/', method: 'GET' }))
      .rejects
      .toEqual(mockError);
  });
});
