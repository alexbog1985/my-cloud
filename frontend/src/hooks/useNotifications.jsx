import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification, removeNotification, clearNotifications } from '../store/slices/notificationsSlice';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const {notifications} = useSelector((state) => state.notifications);

  const addNotificationAction = useCallback((message, type = 'error', duration = 5000) => {
    const id = Date.now();

    dispatch(addNotification({ id, message, type, duration }));

    if (duration > 0) {
      setTimeout(() => {
        dispatch(removeNotification(id));
      }, duration);
    }

    return id;
  }, [dispatch]);

  const removeNotificationAction = useCallback((id) => {
    dispatch(removeNotification(id));
  }, [dispatch])

  const error = useCallback((message, duration = 5000) => {
    return addNotificationAction(message, 'error', duration);
  }, [addNotificationAction]);

  const success = useCallback((message, duration = 3000) => {
    return addNotificationAction(message, 'success', duration);
  }, [addNotificationAction]);

  const warning = useCallback((message, duration = 4000) => {
    return addNotificationAction(message, 'warning', duration);
  }, [addNotificationAction]);

  const clear = useCallback(() => {
    dispatch(clearNotifications());
  },[dispatch]);

  return {
    notifications,
    addNotificationAction,
    error,
    success,
    warning,
    clear,
    removeNotification: removeNotificationAction,
  };
};
