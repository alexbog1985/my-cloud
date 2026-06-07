import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { clearErrors, setErrors, setLoading, setToken, setUser } from '../store/slices/authSlice';
import { useApi } from './useApi';
import { useNotifications } from './useNotifications';

export const useAuthSubmit = (onSuccessRedirectPath) => {
  const dispatch = useDispatch();
  const { request } = useApi();
  const { error, success } = useNotifications();

  return useCallback(async (apiUrl, formData) => {
    dispatch(setLoading());
    dispatch(clearErrors());
    try {
      const response = await request({
        url: apiUrl,
        method: "POST",
        data: formData
      });

      if (response.data.access) {
        dispatch(setToken(response.data.access));
      }

      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }

      if (response.data.user) {
        dispatch(setUser(response.data.user));
      }

      if (apiUrl.includes('/login')) {
        success('Вы успешно вошли в систему');
      } else if (apiUrl.includes('/register')) {
        success('Регистрация прошла успешно!');
      }

      return response.data;
    } catch (err) {
      const apiErrors = err.response?.data ?
        Object.keys(err.response.data).reduce((acc, key) => {
          const value = err.response.data[key];
          acc[key] = Array.isArray(value) ? value[0] : value;
          return acc;
        }, {}) : {detail: 'Ошибка авторизации'};

      dispatch(setErrors(apiErrors));

      if (apiErrors.detail) {
        error(apiErrors.detail);
      } else {
        error('Ошибка авторизации');
      }

      throw err;
    }
  }, [dispatch, request, error, success, onSuccessRedirectPath]);
}
