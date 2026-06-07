const { renderHook, waitFor } = require('@testing-library/react');

// Импорты после моков
const { useApi } = require('../../src/hooks/useApi');
const { logout, updateToken } = require('../../src/store/slices/authSlice');
const api = require('../../src/services/api');

// Моки для зависимостей
jest.mock('../../src/store/slices/authSlice');
jest.mock('react-redux');
jest.mock('../../src/services/api');

const dispatchMock = jest.fn();

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Настройка моков по умолчанию
    require('react-redux').useDispatch.mockReturnValue(dispatchMock);
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('хук должен быть определен', () => {
    expect(useApi).toBeDefined();
  });

  test('должен возвращать метод request', () => {
    const { result } = renderHook(() => useApi());
    expect(result.current).toHaveProperty('request');
    expect(typeof result.current.request).toBe('function');
  });

  describe('request', () => {
    test('должен возвращать результат API вызова', async () => {
      // Given
      const mockResponse = { data: { success: true } };
      api.mockResolvedValue(mockResponse);

      // When
      const { result } = renderHook(() => useApi());
      const response = await result.current.request({ url: '/test/', method: 'GET' });

      // Then
      expect(response).toEqual(mockResponse);
      expect(api).toHaveBeenCalledWith({ url: '/test/', method: 'GET' });
    });

    test('должен обрабатывать 401 ошибку без refresh token и вызывать logout', async () => {
      // Given
      const mockError = {
        response: { status: 401, data: { detail: 'Unauthorized' } },
      };
      api.mockRejectedValue(mockError);

      // Мок localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(null),
        },
        writable: true,
      });

      // When
      const { result } = renderHook(() => useApi());

      // Then
      await expect(result.current.request({ url: '/test/', method: 'GET' }))
        .rejects
        .toEqual(mockError);

      expect(dispatchMock).toHaveBeenCalledWith(logout());
    });

    test('должен прокидывать ошибки сети', async () => {
      // Given
      const mockError = new Error('Network error');
      api.mockRejectedValue(mockError);

      // When
      const { result } = renderHook(() => useApi());

      // Then
      await expect(result.current.request({ url: '/test/', method: 'GET' }))
        .rejects
        .toEqual(mockError);
    });

    test('должен прокидывать ошибки без response', async () => {
      // Given
      const mockError = { message: 'Something went wrong' };
      api.mockRejectedValue(mockError);

      // When
      const { result } = renderHook(() => useApi());

      // Then
      await expect(result.current.request({ url: '/test/', method: 'GET' }))
        .rejects
        .toEqual(mockError);
    });
  });

  describe('refresh token flow', () => {
    test('должен обновлять токен и повторять запрос при 401', async () => {
      // Given
      const mockRefreshToken = 'refresh-token';
      const mockNewAccessToken = 'new-access-token';

      const originalRequest = { url: '/data/', method: 'GET' };
      const mockResponse = { data: { success: true } };

      // Настройка моков
      api.mockRejectedValueOnce({
        response: { status: 401, data: { detail: 'Unauthorized' } },
      });

      api.post = jest.fn().mockResolvedValueOnce({
        data: { access: mockNewAccessToken },
      });

      api.mockResolvedValueOnce(mockResponse);

      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(mockRefreshToken),
        },
        writable: true,
      });

      const { result } = renderHook(() => useApi());

      // When
      const response = await result.current.request(originalRequest);

      // Then
      expect(response).toEqual(mockResponse);
      expect(api.post).toHaveBeenCalledWith('/token/refresh/', { refresh: mockRefreshToken });
      expect(dispatchMock).toHaveBeenCalledWith(updateToken(mockNewAccessToken));

      // Проверить, что оригинальный запрос был повторен с новым токеном
      const expectedConfigWithToken = {
        ...originalRequest,
        headers: { Authorization: `Bearer ${mockNewAccessToken}` },
      };
      expect(api).toHaveBeenCalledWith(expectedConfigWithToken);
    });

    test('д��лжен logout при ошибке обновления токена', async () => {
      // Given
      const mockRefreshToken = 'refresh-token';

      api.mockRejectedValueOnce({
        response: { status: 401, data: { detail: 'Unauthorized' } },
      });

      api.post = jest.fn().mockRejectedValueOnce(new Error('Invalid refresh token'));

      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue(mockRefreshToken),
        },
        writable: true,
      });

      const { result } = renderHook(() => useApi());

      // When
      await expect(result.current.request({ url: '/test/', method: 'GET' }))
        .rejects
        .toThrow('Invalid refresh token');

      // Then
      expect(dispatchMock).toHaveBeenCalledWith(logout());
    });
  });
});
