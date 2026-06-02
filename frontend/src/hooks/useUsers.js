import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useApi } from "./useApi";
import {
  setLoading,
  setUsers,
  setErrors,
  updateUser,
  removeUser,
} from "../store/slices/usersSlice.js";

export const useUsers = () => {
  const dispatch = useDispatch();
  const { request } = useApi();

  const fetchUsers = useCallback(async () => {
    dispatch(setLoading());
    try {
      const response = await request({ url: "/users/all", method: "GET" });
      dispatch(setUsers(response.data));
    } catch (error) {
      dispatch(setErrors(error.response?.data || { general: 'Ошибка загрузки пользователей'}));
    }
  }, [dispatch, request]);

  const toggleAdmin = useCallback(async (userId) => {
    try {
      const response = await request({url: `/users/${userId}/toggle-admin/`, method: "PUT"});
      dispatch(updateUser(response.data));
      dispatch(setErrors({}));
    } catch (error) {
      dispatch(setErrors({toggle: error.response?.data || 'Ошибка изменения прав администратора'}));
    }
  }, [dispatch, request])

  const deleteUser = useCallback(async (userId) => {
    try {
      await request({ url: `/users/${userId}/delete/`, method: 'DELETE' });
      dispatch(removeUser(userId));
      dispatch(setErrors({}));
    } catch (error) {
      dispatch(setErrors({ delete: error.response?.data || 'Ошибка удаления пользователя' }));
    }
  }, [dispatch, request]);

  return { fetchUsers, toggleAdmin, deleteUser };
};
