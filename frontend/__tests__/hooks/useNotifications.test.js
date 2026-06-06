import { renderHook, waitFor } from '@testing-library/react';

// Моки для зависимостей ДО импорта useNotifications
jest.mock('../../src/store/slices/notificationsSlice', () => ({
  addNotification: jest.fn().mockImplementation(({ id, message, type, duration } = {}) => ({
    type: 'notifications/addNotification',
    payload: { id, message, type, duration },
  })),
  removeNotification: jest.fn().mockImplementation((id) => ({
    type: 'notifications/removeNotification',
    payload: id,
  })),
  clearNotifications: jest.fn().mockImplementation(() => ({
    type: 'notifications/clearNotifications',
  })),
}));
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Импорт после моков
import { useNotifications } from '../../src/hooks/useNotifications.jsx';
import { addNotification, removeNotification, clearNotifications } from '../../src/store/slices/notificationsSlice';

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('хук должен быть определен', () => {
    expect(useNotifications).toBeDefined();
  });

  test('должен возвращать ожидаемые методы', () => {
    require('react-redux').useDispatch.mockReturnValue(jest.fn());
    require('react-redux').useSelector.mockReturnValue({ notifications: [] });

    const { result } = renderHook(() => useNotifications());

    expect(result.current).toHaveProperty('notifications');
    expect(result.current).toHaveProperty('addNotificationAction');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('success');
    expect(result.current).toHaveProperty('warning');
    expect(result.current).toHaveProperty('clear');
    expect(result.current).toHaveProperty('removeNotification');
  });

  test('error должен добавлять уведомление типа error', () => {
    const mockDispatch = jest.fn();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('react-redux').useSelector.mockReturnValue({ notifications: [] });

    const { result } = renderHook(() => useNotifications());

    result.current.error('Тестовое сообщение');

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(String),
        payload: expect.objectContaining({
          message: 'Тестовое сообщение',
          type: 'error',
        }),
      })
    );
  });

  test('success должен добавлять уведомление типа success', () => {
    const mockDispatch = jest.fn();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('react-redux').useSelector.mockReturnValue({ notifications: [] });

    const { result } = renderHook(() => useNotifications());

    result.current.success('Тестовое сообщение');

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(String),
        payload: expect.objectContaining({
          message: 'Тестовое сообщение',
          type: 'success',
        }),
      })
    );
  });

  test('warning должен добавлять уведомление типа warning', () => {
    const mockDispatch = jest.fn();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('react-redux').useSelector.mockReturnValue({ notifications: [] });

    const { result } = renderHook(() => useNotifications());

    result.current.warning('Тестовое сообщение');

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(String),
        payload: expect.objectContaining({
          message: 'Тестовое сообщение',
          type: 'warning',
        }),
      })
    );
  });

  test('addNotificationAction должен добавлять уведомление и удалять его через duration', async () => {
    const mockDispatch = jest.fn();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('react-redux').useSelector.mockReturnValue({ notifications: [] });

    const { result } = renderHook(() => useNotifications());

    const id = result.current.addNotificationAction('Тестовое сообщение', 'error', 3000);

    // Проверить, что addNotification был вызван с правильными параметрами
    expect(addNotification).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(Number),
      message: 'Тестовое сообщение',
      type: 'error',
      duration: 3000,
    }));

    // Проверить, что dispatch был вызван с результатом addNotification
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'notifications/addNotification',
        payload: expect.objectContaining({
          id: expect.any(Number),
          message: 'Тестовое сообщение',
          type: 'error',
          duration: 3000,
        }),
      })
    );

    // Сбросить моки
    mockDispatch.mockClear();

    // Промотать таймеры
    jest.advanceTimersByTime(3000);

    // Проверить, что removeNotification был вызван с id
    expect(removeNotification).toHaveBeenCalledWith(id);
    expect(mockDispatch).toHaveBeenCalledWith(removeNotification(id));
  });

  test('clear должен очищать уведомления', () => {
    const mockDispatch = jest.fn();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('react-redux').useSelector.mockReturnValue({ notifications: [] });

    const { result } = renderHook(() => useNotifications());

    result.current.clear();

    expect(mockDispatch).toHaveBeenCalledWith(clearNotifications());
  });

  test('removeNotification должен удалять уведомление по id', () => {
    const mockDispatch = jest.fn();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    require('react-redux').useSelector.mockReturnValue({ notifications: [] });

    const { result } = renderHook(() => useNotifications());

    result.current.removeNotification(123);

    expect(mockDispatch).toHaveBeenCalledWith(removeNotification(123));
  });
});
