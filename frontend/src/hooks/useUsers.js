import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useApi } from "./useApi";
import { useNotifications } from "./useNotifications";
import {
  setLoading,
  setUsers,
  updateUser,
  removeUser,
} from "../store/slices/usersSlice";

export const useUsers = () => {
  const dispatch = useDispatch();
  const { request } = useApi();
  const { error } = useNotifications();

  const fetchUsers = useCallback(async () => {
    dispatch(setLoading());
    try {
      const response = await request({ url: "/users/all", method: "GET" });
      dispatch(setUsers(response.data));
    } catch (err) {
      error(err.response?.data?.error || 'Ошибка загрузки пользователей');
    }
  }, [dispatch, request, error]);

  const toggleAdmin = useCallback(async (userId) => {
    try {
      const response = await request({url: `/users/${userId}/toggle-admin/`, method: "PUT"});
      dispatch(updateUser(response.data));
    } catch (err) {
      error(err.response?.data?.error || 'Ошибка изменения прав администратора');
    }
  }, [dispatch, request, error])

  const deleteUser = useCallback(async (userId) => {
    try {
      await request({ url: `/users/${userId}/delete/`, method: 'DELETE' });
      dispatch(removeUser(userId));
    } catch (err) {
      error(err.response?.data?.error || 'Ошибка удаления пользователя');    }
  }, [dispatch, request, error]);

  return { fetchUsers, toggleAdmin, deleteUser, error };
};
