import api from '../services/api';
import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {logout, updateToken} from '../store/slices/authSlice';

export const useApi = () => {
  const dispatch = useDispatch();

  const request = useCallback(async (config) => {
    try {
      return await api(config);
    } catch (error) {
      if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          dispatch(logout());
          return Promise.reject(error);
        }

        try {
          const response = await api.post('/token/refresh/', { refresh: refreshToken });
          const newToken = response.data.access;

          dispatch(updateToken(newToken));

          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return await api(config);
        } catch (refreshError) {
          dispatch(logout());
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  }, [dispatch]);

  return { request };
};