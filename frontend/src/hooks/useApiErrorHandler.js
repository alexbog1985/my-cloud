import { useCallback } from 'react';
import { useNotifications } from "./useNotifications";

export const useApiErrorHandler = (context = '') => {
  const { error } = useNotifications();

  return useCallback((err, defaultMessage = 'Неизвестная ошибка') => {
    const message = err.response?.data?.detail ||
      err.response?.data?.error ||
      err.response?.data?.file?.[0] ||
      err.message ||
      defaultMessage;

    console.error(`[API error] ${context}:`, message, err);

    error(context ? `${context}: ${message}` : message);

    return message;
  }, [error, context]);
};
