import { useState, useCallback } from 'react';
import api from "../services/api.js";

export function useApi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (url, method = 'GET', body = null, config = {}) => {
    setLoading(true);
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
      const apiError = err.response?.data || err.message || 'Ошибка сети';
      throw apiError || err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
  }, [])

  return { data, loading, request, clear };
}