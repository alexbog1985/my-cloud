const { renderHook, waitFor } = require('@testing-library/react');

// Импорты после моков
const { useNotifications } = require('../../src/hooks/useNotifications');
const { addNotification, removeNotification, clearNotifications } = require('../../src/store/slices/notificationsSlice');

// Моки для зависимостей
jest.mock('../../src/store/slices/notificationsSlice');
jest.mock('react-redux');

const dispatchMock = jest.fn();
const notificationsState = { notifications: [] };

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Настройка моков по умолчанию
    require('react-redux').useDispatch.mockReturnValue(dispatchMock);
    require('react-redux').useSelector.mockReturnValue(notificationsState);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('хук должен быть определен', () => {
    expect(useNotifications).toBeDefined();
  });

  test('должен возвращать ожидаемые методы', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current).toHaveProperty('notifications');
    expect(result.current).toHaveProperty('addNotificationAction');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('success');
    expect(result.current).toHaveProperty('warning');
    expect(result.current).toHaveProperty('clear');
    expect(result.current).toHaveProperty('removeNotification');

    // Проверить, что все методы - функции
    expect(typeof result.current.addNotificationAction).toBe('function');
    expect(typeof result.current.error).toBe('function');
    expect(typeof result.current.success).toBe('function');
    expect(typeof result.current.warning).toBe('function');
    expect(typeof result.current.clear).toBe('function');
    expect(typeof result.current.removeNotification).toBe('function');
  });

  describe('error', () => {
    test('должен добавлять уведомление типа error', () => {
      // Given
      const message = 'Тестовое сообщение';

      const { result } = renderHook(() => useNotifications());

      // When
      result.current.error(message);

      // Then
      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message,
          type: 'error',
          duration: 5000,
        })
      );
      expect(dispatchMock).toHaveBeenCalled();
    });
  });

  describe('success', () => {
    test('должен добавлять уведомление типа success', () => {
      // Given
      const message = 'Тестовое сообщение';

      const { result } = renderHook(() => useNotifications());

      // When
      result.current.success(message);

      // Then
      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message,
          type: 'success',
          duration: 3000,
        })
      );
      expect(dispatchMock).toHaveBeenCalled();
    });
  });

  describe('warning', () => {
    test('должен добавлять уведомление типа warning', () => {
      // Given
      const message = 'Тестовое сообщение';

      const { result } = renderHook(() => useNotifications());

      // When
      result.current.warning(message);

      // Then
      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message,
          type: 'warning',
          duration: 4000,
        })
      );
      expect(dispatchMock).toHaveBeenCalled();
    });
  });

  describe('addNotificationAction', () => {
    test('должен добавлять уведомление и удалять его через duration', () => {
      // Given
      const message = 'Тестовое сообщение';
      const type = 'error';
      const duration = 3000;

      const { result } = renderHook(() => useNotifications());

      // When
      const id = result.current.addNotificationAction(message, type, duration);

      // Then
      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id,
          message,
          type,
          duration,
        })
      );

      // Проверить, что dispatch был вызван
      expect(dispatchMock).toHaveBeenCalled();

      // Проверить, что addNotification был вызван с правильными параметрами
      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message,
          type,
          duration,
        })
      );

      // Очистить моки для следующей проверки
      dispatchMock.mockClear();

      // Промотать таймеры
      jest.advanceTimersByTime(duration);

      // Проверить, что removeNotification был вызван с id
      expect(removeNotification).toHaveBeenCalledWith(id);
      expect(dispatchMock).toHaveBeenCalledWith(removeNotification(id));
    });

    test('должен возвращать id уведомления', () => {
      // Given
      const message = 'Тестовое сообщение';

      const { result } = renderHook(() => useNotifications());

      // When
      const id = result.current.addNotificationAction(message, 'error', 5000);

      // Then
      expect(id).toBeDefined();
      expect(typeof id).toBe('number');
    });
  });

  describe('clear', () => {
    test('должен очищать уведомления', () => {
      // Given
      const { result } = renderHook(() => useNotifications());

      // When
      result.current.clear();

      // Then
      expect(dispatchMock).toHaveBeenCalledWith(clearNotifications());
    });
  });

  describe('removeNotification', () => {
    test('должен удалять уведомление по id', () => {
      // Given
      const notificationId = 123;
      const { result } = renderHook(() => useNotifications());

      // When
      result.current.removeNotification(notificationId);

      // Then
      expect(dispatchMock).toHaveBeenCalledWith(removeNotification(notificationId));
    });
  });

  describe('duration defaults', () => {
    test('error должен использовать duration по умолчанию 5000', () => {
      const { result } = renderHook(() => useNotifications());

      result.current.error('message');

      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 5000,
        })
      );
    });

    test('success должен использовать duration по умолчанию 3000', () => {
      const { result } = renderHook(() => useNotifications());

      result.current.success('message');

      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 3000,
        })
      );
    });

    test('warning должен использовать duration по умолчанию 4000', () => {
      const { result } = renderHook(() => useNotifications());

      result.current.warning('message');

      expect(addNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 4000,
        })
      );
    });
  });
});
