import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { useApi } from './useApi';
import { useCallback } from 'react';
import {useNotifications} from "./useNotifications";

export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { request } = useApi();
  const { error } = useNotifications();

  return useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await request({
          url: '/logout/',
          method: 'POST',
          data: {refresh: refreshToken},
        });
      }
    } catch {
      error('Ошибка выхода')
    }
    dispatch(logout());
    navigate('/login');
  }, [dispatch, error, navigate, request]);
}
