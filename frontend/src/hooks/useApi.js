import api from '../services/api';
import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {logoutAction, setToken} from '../store/slices/authSlice';

export const useApi = () => {
  const dispatch = useDispatch();

  const request = useCallback(async (config) => {
    const { onUploadProgress, ...restConfig } = config;
    try {
      return await api({
        ...restConfig,
        onUploadProgress,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          dispatch(logoutAction());
          return Promise.reject(error);
        }

        try {
          const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
          const newToken = response.data.access;

          dispatch(setToken(newToken));

          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return await api(config);
        } catch (refreshError) {
          dispatch(logoutAction());
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  }, [dispatch]);

  return { request };
};
