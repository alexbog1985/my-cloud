import { useState, useCallback } from 'react';
import api from "../services/api.js";

export function useApi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, method = 'GET', body = null, config = {}) => {
    setLoading(true);
    setError(null);
    setData(null)

    try {
      const response = await api({
        url,
        method,
        data: body,
        ...config,
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data || err.message || 'Ошибка сети';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
  }, [])

  return { data, loading, error, request, clear };
}