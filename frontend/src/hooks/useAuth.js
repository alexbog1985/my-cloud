import { useDispatch} from "react-redux";
import { setLoading, setUser, resetLoading } from "../store/slices/authSlice.js";
import { useApi } from "./useApi.js";
import { useCallback } from "react";
import { useNotifications } from './useNotifications';

export function useAuth() {
  const dispatch = useDispatch();
  const { request } = useApi()
  const { error } = useNotifications();

  const fetchUser = useCallback(async () => {
    try {
      dispatch(setLoading());
      const response = await request({
        url: '/users/me/',
        method: 'GET',
      });
      dispatch(setUser(response.data))
    } catch (err) {
      error(err.message || 'Ошибка загрузки пользователя')
    } finally {
      dispatch(resetLoading());
    }
  }, [dispatch, request, error])
  return { fetchUser };
}
